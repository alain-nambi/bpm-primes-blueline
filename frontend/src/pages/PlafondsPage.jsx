import { useEffect, useState } from 'react';
import { getPrimeMax, createPrimeMax, updatePrimeMax, deletePrimeMax, getEmployees, updateEmployee } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, MoonIcon, ChartIcon, XCircleIcon, LockIcon, CheckIcon } from '../components/Icons';
import Modal from '../components/Modal';

const BONUS_TYPES = [
  { value: 'mensuel', label: 'Mensuel', icon: CalendarIcon, color: 'blue' },
  { value: 'astreinte', label: 'Astreinte', icon: MoonIcon, color: 'violet' },
  { value: 'commission', label: 'Commission', icon: ChartIcon, color: 'amber' },
];

const INTERV_TYPES = [
  { value: 'intervention', label: 'Intervention' },
  { value: 'ponctuelle', label: 'Ponctuelle' },
  { value: 'exceptionnel', label: 'Exceptionnelle' },
];

const ASTR_DEPARTMENTS = ['BBS', 'DO', 'DSI', 'DT'];

const typeColors = {
  blue: { header: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'bg-blue-100 text-blue-600' },
  violet: { header: 'bg-violet-50 text-violet-700 border-violet-200', badge: 'bg-violet-100 text-violet-600' },
  amber: { header: 'bg-amber-50 text-amber-700 border-amber-200', badge: 'bg-amber-100 text-amber-600' },
  rose: { header: 'bg-rose-50 text-rose-700 border-rose-200', badge: 'bg-rose-100 text-rose-600' },
};

const PlafondsPage = () => {
  const { user } = useAuth();
  const [plafonds, setPlafonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [astrEmployees, setAstrEmployees] = useState([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateModalDept, setRateModalDept] = useState('');
  const [rateModalValues, setRateModalValues] = useState({});
  const [rateModalInitial, setRateModalInitial] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const fetchPlafonds = async () => {
    try {
      const data = await getPrimeMax();
      setPlafonds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAstrEmployees = async () => {
    try {
      const all = await getEmployees();
      setAstrEmployees(all.filter(e => ASTR_DEPARTMENTS.includes(e.department)));
    } catch (err) {
      console.error(err);
    }
  };

  const openRateModal = (dept) => {
    setRateModalDept(dept);
    const values = {};
    astrEmployees.filter(e => e.department === dept).forEach(e => {
      if (e.astreinte_rate != null) values[e.id] = e.astreinte_rate.toString();
    });
    setRateModalValues(values);
    setRateModalInitial(astrEmployees.filter(e => e.department === dept && e.astreinte_rate != null).map(e => e.id));
    setShowRateModal(true);
  };

  const applyRate = async () => {
    const deptEmps = astrEmployees.filter(e => e.department === rateModalDept);
    await Promise.all(deptEmps.map(e => {
      const val = rateModalValues[e.id];
      if (val !== undefined && val !== '') {
        return updateEmployee(e.id, { astreinte_rate: parseInt(val) });
      }
      if (val !== undefined && val === '' && rateModalInitial.includes(e.id)) {
        return updateEmployee(e.id, { astreinte_rate: null });
      }
      return Promise.resolve();
    }));
    setShowRateModal(false);
    fetchAstrEmployees();
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPrimeMax();
        setPlafonds(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchAstrEmployees();
  }, []);

  const canEdit = (p) => user?.is_dg || user?.is_drh || p.department === user?.department;

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce plafond ?')) return;
    try {
      await deletePrimeMax(id);
      fetchPlafonds();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleCellSave = async (department, type) => {
    const amount = parseFloat(editValue);
    if (isNaN(amount) || amount <= 0) { setEditingCell(null); return; }
    const existing = plafonds.find(p => p.department === department && p.bonus_type === type);
    try {
      if (existing) {
        await updatePrimeMax(existing.id, { department, bonus_type: type, amount });
      } else {
        await createPrimeMax({ department, bonus_type: type, amount });
      }
      fetchPlafonds();
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
    setEditingCell(null);
  };

  const openCellEdit = (department, type) => {
    const plafond = plafonds.find(p => p.department === department && p.bonus_type === type);
    setEditingCell({ department, type });
    setEditValue(plafond ? parseFloat(plafond.amount).toString() : '');
  };

  const renderCell = (dept, type) => {
    const canEditDept = user?.is_dg || user?.is_drh || dept === user?.department;
    const plafond = plafonds.find(p => p.department === dept && p.bonus_type === type);
    const isEditing = editingCell?.department === dept && editingCell?.type === type;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCellSave(dept, type); if (e.key === 'Escape') setEditingCell(null); }}
            autoFocus />
          <button onClick={() => handleCellSave(dept, type)} className="text-green-600 hover:text-green-800 text-sm font-bold">✓</button>
          <button onClick={() => setEditingCell(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
      );
    }
    return (
      <span onClick={() => { if (canEditDept) openCellEdit(dept, type); }}
        className={`${canEditDept ? 'cursor-pointer hover:bg-violet-50 px-2 py-1 rounded' : 'text-gray-400'} inline-block transition-colors`}>
        {plafond ? (
          <span className="font-medium">{parseFloat(plafond.amount).toLocaleString('fr-FR')} <span className="text-gray-400 font-normal">Ar</span></span>
        ) : (
          <span className="text-gray-300 italic">—</span>
        )}
      </span>
    );
  };

  const SectionCard = ({ color, icon: Icon, title, subtitle, children }) => {
    const c = typeColors[color] || typeColors.blue;
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className={`px-4 py-2 flex items-center gap-2 border-b ${c.header}`}>
          {Icon && <Icon className="w-4 h-4" />}
          <span className="font-semibold text-sm">{title}</span>
          {subtitle && <span className="text-xs font-normal opacity-60">— {subtitle}</span>}
        </div>
        {children}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48"><span className="loading loading-spinner loading-md" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Plafonds des Primes</h1>
        <p className="text-sm text-gray-400">
          {user?.is_dg || user?.is_drh
            ? 'Accès total — vous pouvez modifier tous les plafonds'
            : `Vous ne pouvez modifier que les plafonds de votre département (${user?.department})`}
        </p>
      </div>

      <div className="space-y-3">
        {BONUS_TYPES.map((bt) => {
          const items = plafonds.filter(p => p.bonus_type === bt.value).sort((a, b) => a.department.localeCompare(b.department));
          if (items.length === 0) return null;
          const chunked = items.reduce((acc, _, i) => i % 2 === 0 ? [...acc, items.slice(i, i + 2)] : acc, []);
          return (
            <SectionCard key={bt.value} color={bt.color} icon={bt.icon}
              title={bt.label} subtitle={`${items.length} département${items.length !== 1 ? 's' : ''}`}>
              <table className="table table-sm table-zebra w-full">
                <thead>
                  <tr>
                    <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Département</th>
                    <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant max</th>
                    <th className="border-l-2 border-gray-200 text-gray-500 font-medium text-xs uppercase tracking-wider">Département</th>
                    <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant max</th>
                  </tr>
                </thead>
                <tbody>
                  {chunked.map((pair, i) => (
                    <tr key={i} className="hover">
                      <td className="font-medium text-gray-900">{pair[0].department}</td>
                      <td className={!canEdit(pair[0]) ? 'opacity-50' : ''}>
                        <div className="flex items-center justify-between gap-1">
                          {renderCell(pair[0].department, pair[0].bonus_type)}
                          {canEdit(pair[0]) ? (
                            <button className="text-gray-300 hover:text-red-500 transition-colors" title="Supprimer" onClick={() => handleDelete(pair[0].id)}>
                              <XCircleIcon className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-gray-200"><LockIcon className="w-3 h-3 inline" /></span>
                          )}
                        </div>
                      </td>
                      <td className="border-l-2 border-gray-200 font-medium text-gray-900">{pair[1]?.department ?? ''}</td>
                      <td className={pair[1] && !canEdit(pair[1]) ? 'opacity-50' : ''}>
                        {pair[1] ? (
                          <div className="flex items-center justify-between gap-1">
                            {renderCell(pair[1].department, pair[1].bonus_type)}
                            {canEdit(pair[1]) ? (
                              <button className="text-gray-300 hover:text-red-500 transition-colors" title="Supprimer" onClick={() => handleDelete(pair[1].id)}>
                                <XCircleIcon className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-gray-200"><LockIcon className="w-3 h-3 inline" /></span>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          );
        })}

        <SectionCard color="rose" icon={MoonIcon}
          title="Interventions" subtitle="Taux par type d'intervention — BBS, DO, DSI, DT">
          <table className="table table-sm table-zebra w-full">
            <thead>
              <tr>
                <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Département</th>
                {INTERV_TYPES.map(t => (
                  <th key={t.value} className="text-gray-500 font-medium text-xs uppercase tracking-wider">{t.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASTR_DEPARTMENTS.map((dept) => (
                <tr key={dept}>
                  <td className="font-medium text-gray-900">{dept}</td>
                  {INTERV_TYPES.map((t) => <td key={t.value}>{renderCell(dept, t.value)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        {(user?.is_dg || user?.is_drh) && (
          <SectionCard color="violet" icon={MoonIcon}
            title="Astreinte — Taux spéciaux" subtitle="Configurer un taux personnalisé par département">
            <table className="table table-sm table-zebra w-full">
              <thead>
                <tr>
                  <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Département</th>
                  <th className="text-gray-500 font-medium text-xs uppercase tracking-wider">Employés avec taux spécial</th>
                  <th className="w-32"></th>
                </tr>
              </thead>
              <tbody>
                {ASTR_DEPARTMENTS.map((dept) => {
                  const deptEmps = astrEmployees.filter(e => e.department === dept);
                  const specials = deptEmps.filter(e => e.astreinte_rate != null);
                  return (
                    <tr key={dept}>
                      <td className="font-medium text-gray-900">{dept}</td>
                      <td className="text-sm text-gray-500">
                        {specials.length === 0
                          ? <span className="text-gray-400 italic">Aucun</span>
                          : specials.map(e => `${e.name} (${e.astreinte_rate.toLocaleString('fr-FR')} Ar)`).join(', ')
                        }
                      </td>
                      <td>
                        <button onClick={() => openRateModal(dept)}
                          className="btn btn-xs bg-violet-600 hover:bg-violet-700 text-white border-0">
                          Configurer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </SectionCard>
        )}
      </div>

      <Modal open={showRateModal} onClose={() => setShowRateModal(false)} title={`Taux spéciaux — ${rateModalDept}`} size="lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" id="bulkRate" placeholder="Taux commun"
              className="w-28 px-2 py-1 rounded border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            <button onClick={() => {
              const v = document.getElementById('bulkRate').value;
              if (!v) return;
              setRateModalValues(prev => {
                const next = { ...prev };
                astrEmployees.filter(e => e.department === rateModalDept).forEach(e => {
                  if (!next[e.id] || next[e.id] === '') next[e.id] = v;
                });
                return next;
              });
              document.getElementById('bulkRate').value = '';
            }} className="btn btn-xs bg-violet-100 text-violet-700 hover:bg-violet-200 border-0">Remplir les vides</button>
            <button onClick={() => {
              setRateModalValues(prev => {
                const next = { ...prev };
                astrEmployees.filter(e => e.department === rateModalDept).forEach(e => { next[e.id] = ''; });
                return next;
              });
            }} className="btn btn-xs btn-ghost text-gray-500">Tout effacer</button>
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-1">
            {astrEmployees.filter(e => e.department === rateModalDept).map(emp => {
              const val = rateModalValues[emp.id];
              const hasVal = val !== undefined && val !== '';
              return (
                <div key={emp.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${hasVal ? 'bg-violet-50 border border-violet-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                  <span className="text-sm font-medium flex-1">{emp.name}</span>
                  <input type="number" value={val || ''}
                    onChange={(e) => setRateModalValues(prev => ({ ...prev, [emp.id]: e.target.value }))}
                    placeholder="Défaut"
                    className="w-24 px-2 py-1 rounded border border-gray-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
                  {val === '' && emp.astreinte_rate != null &&
                    <span className="text-xs text-red-400 w-16 text-right">effacé</span>}
                  {hasVal &&
                    <span className="text-xs text-violet-600 w-16 text-right">{parseInt(val).toLocaleString('fr-FR')} Ar</span>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <button onClick={() => setShowRateModal(false)} className="btn btn-sm btn-ghost">Annuler</button>
            <button onClick={applyRate} className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0 flex items-center gap-1 shadow-sm hover:shadow">
              <CheckIcon className="w-4 h-4" /> Appliquer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlafondsPage;
