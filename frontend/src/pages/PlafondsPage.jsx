import { useEffect, useState } from 'react';
import { getPrimeMax, createPrimeMax, updatePrimeMax, deletePrimeMax, getEmployees, updateEmployee } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, XCircleIcon, LockIcon, MoonIcon, CheckIcon } from '../components/Icons';
import Modal from '../components/Modal';

const BONUS_TYPES = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'astreinte', label: 'Astreinte' },
  { value: 'commission', label: 'Commission' },
];

const INTERV_TYPES = [
  { value: 'intervention', label: 'Intervention' },
  { value: 'ponctuelle', label: 'Ponctuelle' },
  { value: 'exceptionnel', label: 'Exceptionnelle' },
];

const ASTR_DEPARTMENTS = ['BBS', 'DO', 'DSI', 'DT'];

const PlafondsPage = () => {
  const { user } = useAuth();
  const [plafonds, setPlafonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [astrEmployees, setAstrEmployees] = useState([]);
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateModalDept, setRateModalDept] = useState('');
  const [rateModalValue, setRateModalValue] = useState('');
  const [rateModalSelected, setRateModalSelected] = useState([]);
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
    setRateModalValue('');
    if (rateModalDept !== dept) setRateModalSelected([]);
    setShowRateModal(true);
  };

  const toggleRateSelected = (id) => {
    setRateModalSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const applyRate = async () => {
    const rate = rateModalValue === '' ? null : parseInt(rateModalValue);
    const deptEmps = astrEmployees.filter(e => e.department === rateModalDept);
    await Promise.all(deptEmps.map(e => updateEmployee(e.id, { astreinte_rate: rateModalSelected.includes(e.id) ? rate : null })));
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

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg" /></div>;
  }

  const renderCell = (dept, type, colorRing = 'rose') => {
    const canEditDept = user?.is_dg || user?.is_drh || dept === user?.department;
    const plafond = plafonds.find(p => p.department === dept && p.bonus_type === type);
    const isEditing = editingCell?.department === dept && editingCell?.type === type;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCellSave(dept, type); if (e.key === 'Escape') setEditingCell(null); }}
            autoFocus />
          <button onClick={() => handleCellSave(dept, type)} className="text-green-600 hover:text-green-800 text-sm font-bold">✓</button>
          <button onClick={() => setEditingCell(null)} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
      );
    }
    return (
      <span onClick={() => { if (canEditDept) openCellEdit(dept, type); }}
        className={`${canEditDept ? 'cursor-pointer hover:bg-rose-50 px-2 py-1 rounded' : 'text-gray-400'} inline-block`}>
        {plafond ? `${parseFloat(plafond.amount).toLocaleString('fr-FR')} Ar` : '—'}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plafonds des Primes</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.is_dg || user?.is_drh ? 'Accès total — vous pouvez modifier tous les plafonds' : `Vous ne pouvez modifier que les plafonds de votre département (${user?.department})`}</p>
      </div>

      <div className="space-y-6">
        {BONUS_TYPES.map((bt) => {
          const items = plafonds.filter(p => p.bonus_type === bt.value);
          if (items.length === 0) return null;
          const typeColors = { mensuel: 'bg-blue-50 text-blue-600 border-blue-200', astreinte: 'bg-violet-50 text-violet-600 border-violet-200', commission: 'bg-amber-50 text-amber-600 border-amber-200' };
          const color = typeColors[bt.value] || typeColors.mensuel;
          return (
            <div key={bt.value} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className={`px-5 py-3 font-semibold text-sm border-b ${color}`}>
                {bt.label} — {items.length} département{items.length !== 1 ? 's' : ''}
              </div>
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Département</th>
                    <th>Montant max (Ar)</th>
                    <th className="w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id} className={!canEdit(p) ? 'opacity-60' : ''}>
                      <td className="font-medium text-gray-900">{p.department}</td>
                      <td>{renderCell(p.department, p.bonus_type)}</td>
                      <td>
                        {canEdit(p) ? (
                          <button className="btn btn-sm btn-ghost text-red-500" title="Supprimer" onClick={() => handleDelete(p.id)}>
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 px-2"><LockIcon className="w-3 h-3 inline" /></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 font-semibold text-sm bg-rose-50 text-rose-600 border-b border-rose-200 flex items-center gap-2">
          <MoonIcon className="w-4 h-4" /> Interventions
          <span className="text-xs font-normal text-rose-400">— Taux par type d'intervention</span>
        </div>
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Département</th>
              {INTERV_TYPES.map(t => <th key={t.value}>{t.label} (Ar)</th>)}
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
      </div>

      {(user?.is_dg || user?.is_drh) && (
        <div className="mt-10 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 font-semibold text-sm bg-violet-50 text-violet-600 border-b border-violet-200 flex items-center gap-2">
            <MoonIcon className="w-4 h-4" /> Astreinte — Taux spéciaux
            <span className="text-xs font-normal text-violet-400">— Configurer un taux personnalisé par département</span>
          </div>
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Département</th>
                <th>Employés avec taux spécial</th>
                <th className="w-40">Actions</th>
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
                        ? <span className="text-gray-400">Aucun</span>
                        : specials.map(e => `${e.name} (${e.astreinte_rate.toLocaleString('fr-FR')} Ar)`).join(', ')
                      }
                    </td>
                    <td>
                      <button onClick={() => openRateModal(dept)} className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0">Configurer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showRateModal} onClose={() => setShowRateModal(false)} title={`Configurer — ${rateModalDept}`} size="lg">
        <div className="space-y-4">
          <div>
            <label className="label"><span className="label-text font-medium">Taux spécial (Ar/semaine)</span></label>
            <input type="number" value={rateModalValue} onChange={(e) => setRateModalValue(e.target.value)}
              placeholder="70000 (défaut)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
          </div>
          <div>
            <label className="label"><span className="label-text font-medium">Appliquer à :</span></label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{rateModalSelected.length} employé(s) sélectionné(s)</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRateModalSelected(astrEmployees.filter(e => e.department === rateModalDept).map(e => e.id))} className="btn btn-xs btn-ghost text-violet-600">Tout sélectionner</button>
                <button type="button" onClick={() => setRateModalSelected([])} className="btn btn-xs btn-ghost text-gray-500">Tout désélectionner</button>
              </div>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {astrEmployees.filter(e => e.department === rateModalDept).map(emp => (
                <label key={emp.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${rateModalSelected.includes(emp.id) ? 'bg-violet-50 border border-violet-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                  <input type="checkbox" checked={rateModalSelected.includes(emp.id)} onChange={() => toggleRateSelected(emp.id)}
                    className="checkbox checkbox-sm checkbox-violet-600" />
                  <span className="flex-1 text-sm font-medium">{emp.name}</span>
                  {emp.astreinte_rate != null && <span className="text-xs text-violet-600 bg-violet-100 px-2 py-0.5 rounded">Actuel: {emp.astreinte_rate.toLocaleString('fr-FR')} Ar</span>}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowRateModal(false)} className="btn btn-sm btn-ghost">Annuler</button>
            <button onClick={applyRate} className="btn btn-sm bg-violet-600 hover:bg-violet-700 text-white border-0 flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> Appliquer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlafondsPage;
