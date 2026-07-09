"""
Sync employees and departments from LDAP into BPM database.
Usage:  python -m scripts.sync_ldap

Fetches all users from the company LDAP directory and:
  1. Creates/updates Department records
  2. Creates/updates User records (managers, directors, …)
  3. Creates/updates Employee records with manager relationships
  4. Resolves the LDAP ``manager`` DN attribute to BPM User FK

Run periodically via CRON or systemd timer to keep data fresh.
"""

import os
import sys
import logging

sys.path.append('.')

# Load .env file manually (avoids a dotenv dependency)
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(_env_path):
    with open(_env_path) as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _key, _val = _line.split('=', 1)
                os.environ.setdefault(_key.strip(), _val.strip())

from ldap3 import ALL, Connection, Server
from ldap3.core.exceptions import LDAPException

from app.db_config import TORTOISE_ORM
from tortoise import Tortoise, run_async
from app.models import User, Employee, Department
from app.auth import get_password_hash

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LDAP configuration (from environment / .env)
# ---------------------------------------------------------------------------
LDAP_SERVER_URI = os.getenv('LDAP_SERVER_URI', 'ldap://ldap.blueline.mg:389')
LDAP_BIND_DN = os.getenv('LDAP_BIND_DN', 'cn=admin,dc=blueline,dc=mg')
LDAP_BIND_PASSWORD = os.getenv('LDAP_BIND_PASSWORD', 'blueline2488')
LDAP_USER_SEARCH_BASE = os.getenv('LDAP_USER_SEARCH_BASE', 'dc=blueline,dc=mg')

LDAP_ATTRS = [
    'uid', 'mail', 'givenName', 'sn', 'cn',
    'employeeNumber', 'departmentNumber', 'ou',
    'title', 'employeeType', 'manager',
]

# ---------------------------------------------------------------------------
# Known directors / special roles
# Emails listed here get their corresponding BPM User flags regardless of
# what LDAP says.  Add or remove entries as needed.
# ---------------------------------------------------------------------------
DIRECTORS: dict[str, dict] = {
    'rivo@gulfsat.mg': {
        'name': 'Nantenaina Ulrich', 'poste': 'DSI', 'is_directeur': True,
    },
    'dg@blueline.mg': {
        'name': 'Directeur Général', 'poste': 'DG', 'is_dg': True,
    },
    'johary.drh@blueline.mg': {
        'name': 'Johary', 'poste': 'DRH', 'is_drh': True,
    },
    'directeur@blueline.mg': {
        'name': 'Directeur Général Adjoint', 'poste': 'Directeur',
        'is_directeur': True,
    },
}

# ---------------------------------------------------------------------------
# LDAP helpers
# ---------------------------------------------------------------------------

def _connect() -> Connection:
    server = Server(LDAP_SERVER_URI, get_info=ALL, connect_timeout=5)
    return Connection(
        server,
        user=LDAP_BIND_DN,
        password=LDAP_BIND_PASSWORD,
        auto_bind=True,
        receive_timeout=5,
    )


def _first(entry, attr):
    if attr not in entry:
        return None
    value = entry[attr].value
    return value[0] if isinstance(value, list) and value else value


def fetch_all_ldap_users() -> list[dict]:
    """Return a list of attribute-dicts for every LDAP entry with ``mail``."""
    conn = _connect()
    results: list[dict] = []
    try:
        conn.search(
            search_base=LDAP_USER_SEARCH_BASE,
            search_filter='(mail=*)',
            attributes=LDAP_ATTRS,
            paged_size=500,
        )
        for entry in conn.entries:
            record = {attr: _first(entry, attr) for attr in LDAP_ATTRS}
            record['dn'] = entry.entry_dn
            email = (record.get('mail') or '').strip().lower()
            if not email:
                continue
            record['email'] = email
            results.append(record)
    finally:
        conn.unbind()
    return results


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

def _dept_name(rec: dict) -> str:
    return rec.get('departmentNumber') or rec.get('ou') or 'Inconnu'


def _full_name(rec: dict) -> str:
    given = rec.get('givenName') or ''
    sn = rec.get('sn') or ''
    if given and sn:
        return f'{given} {sn}'
    return rec.get('cn') or given or sn or rec.get('uid', 'Inconnu')


def _matricule(rec: dict, email: str) -> str:
    raw = rec.get('employeeNumber')
    if raw and str(raw).strip().isdigit():
        return str(int(raw)).zfill(5)
    return rec.get('uid') or email.split('@')[0]


# ---------------------------------------------------------------------------
# Main sync
# ---------------------------------------------------------------------------

async def sync():
    await Tortoise.init(config=TORTOISE_ORM)

    log.info('Connexion à l\'AD…')
    try:
        ldap_users = fetch_all_ldap_users()
    except LDAPException as e:
        log.error('Erreur de connexion LDAP : %s', e)
        await Tortoise.close_connections()
        return

    log.info('%d utilisateur(s) trouvé(s) dans l\'AD.', len(ldap_users))
    if not ldap_users:
        log.warning('Aucun utilisateur – vérifiez le filtre de recherche.')
        await Tortoise.close_connections()
        return

    # Index DN → record (for manager resolution)
    dn_index = {u['dn']: u for u in ldap_users if u.get('dn')}
    # Index email → LDAP record
    email_index = {u['email']: u for u in ldap_users}

    # ------------------------------------------------------------------
    # 1. Departments
    # ------------------------------------------------------------------
    all_dept_names = {_dept_name(u) for u in ldap_users}
    log.info('=== Départements (%d) ===', len(all_dept_names))
    dept_cache: dict[str, Department] = {}
    for name in sorted(all_dept_names):
        dept, created = await Department.get_or_create(name=name)
        dept_cache[name] = dept
        log.info('  %s %s', '✓ Créé' if created else '~ Exist', name)

    # ------------------------------------------------------------------
    # 2. Determine who is a manager (referenced by ``manager`` in LDAP)
    # ------------------------------------------------------------------
    manager_dns: set[str] = set()
    for u in ldap_users:
        m = u.get('manager')
        if m:
            manager_dns.add(m)

    manager_emails: set[str] = set()
    for dn in manager_dns:
        if dn in dn_index:
            manager_emails.add(dn_index[dn]['email'])
        # Try partial match
        for other_dn, other_rec in dn_index.items():
            if dn in other_dn or other_dn in dn:
                manager_emails.add(other_rec['email'])
                break

    # ------------------------------------------------------------------
    # 3. Users (BPM accounts) – must exist before Employee manager FK
    # ------------------------------------------------------------------
    users_to_create: set[str] = (
        manager_emails
        | set(DIRECTORS.keys())
        | {u.email async for u in User.all()}
    )

    log.info('=== Utilisateurs BPM ===')
    users_created = 0
    users_updated = 0
    user_by_email: dict[str, User] = {}

    for email in sorted(users_to_create):
        ldap_rec = email_index.get(email)

        # Determine roles
        is_n1 = email in manager_emails
        is_dir = bool(DIRECTORS.get(email, {}).get('is_directeur'))
        is_drh = bool(DIRECTORS.get(email, {}).get('is_drh'))
        is_dg = bool(DIRECTORS.get(email, {}).get('is_dg'))

        if ldap_rec:
            name = _full_name(ldap_rec)
            poste = ldap_rec.get('title') or ldap_rec.get('employeeType') or ''
            dept_name = _dept_name(ldap_rec)
        elif email in DIRECTORS:
            d = DIRECTORS[email]
            name = d.get('name', email)
            poste = d.get('poste', '')
            dept_name = d.get('department', '')
        else:
            continue  # existing User whose email no longer in LDAP – skip

        dept_obj = dept_cache.get(dept_name)

        existing = await User.get_or_none(email=email)
        if existing:
            existing.name = name
            existing.poste = poste
            existing.dept_str = dept_name
            existing.dept = dept_obj
            existing.is_validator_n1 = is_n1 or existing.is_validator_n1
            if email in DIRECTORS:
                existing.is_directeur = is_dir
                existing.is_drh = is_drh
                existing.is_dg = is_dg
            await existing.save()
            user_by_email[email] = existing
            users_updated += 1
        else:
            user = await User.create(
                email=email,
                name=name,
                poste=poste,
                dept_str=dept_name,
                dept=dept_obj,
                is_validator_n1=is_n1,
                is_directeur=is_dir,
                is_drh=is_drh,
                is_dg=is_dg,
                password_hash=get_password_hash(os.urandom(24).hex()),
            )
            user_by_email[email] = user
            users_created += 1
            log.info('  ✓ Créé  %s (%s)', name, email)

    if users_updated:
        log.info('  ~ Mis à jour %d utilisateur(s)', users_updated)

    # ------------------------------------------------------------------
    # 4. Employees (all LDAP users)
    # ------------------------------------------------------------------
    log.info('=== Employés ===')

    # Pre-collect default manager per department (first User in each dept)
    dept_head: dict[str, User | None] = {}
    for dept_name in all_dept_names:
        first = await User.filter(dept_str=dept_name).first()
        dept_head[dept_name] = first
    # Global fallback – DG
    dg_user = await User.filter(is_dg=True).first()

    employees_created = 0
    employees_updated = 0
    manager_resolved = 0
    manager_fallback = 0

    for u in ldap_users:
        email = u['email']
        matricule = _matricule(u, email)
        name = _full_name(u)
        dept_name = _dept_name(u)
        dept_obj = dept_cache.get(dept_name)

        # Resolve manager User
        manager_user: User | None = None
        raw_manager_dn = u.get('manager')
        manager_dn = None

        if raw_manager_dn:
            # Direct match
            if raw_manager_dn in dn_index:
                manager_dn = raw_manager_dn
            else:
                # Partial match
                for candidate_dn in dn_index:
                    if raw_manager_dn in candidate_dn or candidate_dn in raw_manager_dn:
                        manager_dn = candidate_dn
                        break

        if manager_dn:
            mgr_email = dn_index[manager_dn]['email']
            manager_user = user_by_email.get(mgr_email)

        # Fallback: department head
        if not manager_user:
            manager_user = dept_head.get(dept_name)

        # Final fallback: DG
        if not manager_user:
            manager_user = dg_user

        if manager_user and manager_dn:
            manager_resolved += 1
        elif manager_user and not manager_dn:
            manager_fallback += 1

        emp_defaults = {
            'name': name,
            'dept_str': dept_name,
            'dept': dept_obj,
            'manager': manager_user,
        }

        emp, created = await Employee.get_or_create(
            matricule=matricule,
            defaults=emp_defaults,
        )
        if not created:
            await emp.update_from_dict(emp_defaults).save()
            employees_updated += 1
        else:
            employees_created += 1
            log.info('  ✓ Créé  %s (%s) [%s]', name, matricule, dept_name)

    if employees_updated:
        log.info('  ~ Mis à jour %d employé(s)', employees_updated)

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    log.info('')
    log.info('=' * 52)
    log.info('  Synchronisation terminée')
    log.info('  Départements : %d', len(all_dept_names))
    log.info('  Employés     : %d créés, %d mis à jour',
             employees_created, employees_updated)
    log.info('  Utilisateurs : %d créés, %d mis à jour',
             users_created, users_updated)
    log.info('  Managers     : %d résolus LDAP, %d par défaut',
             manager_resolved, manager_fallback)
    log.info('=' * 52)

    await Tortoise.close_connections()


if __name__ == '__main__':
    run_async(sync())
