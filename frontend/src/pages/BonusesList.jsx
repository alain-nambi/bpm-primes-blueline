import { useEffect, useState } from 'react';
import { getBonuses, validateBonus } from '../services/api';
import { Link } from 'react-router-dom';

const BonusesList = () => {
  const [bonuses, setBonuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBonuses();
  }, [statusFilter]);

  const fetchBonuses = async () => {
    try {
      const data = await getBonuses(statusFilter || null);
      setBonuses(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleValidate = async (bonusId, step) => {
    try {
      await validateBonus(bonusId, { action: 'VALIDER' }, step);
      alert('Prime validée !');
      fetchBonuses();
    } catch (error) {
      alert('Erreur lors de la validation');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Liste des Primes</h1>
        <Link to="/bonuses/new" className="btn btn-primary">Nouvelle Prime</Link>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          className="select select-bordered w-full max-w-xs"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="Initialisé">Initialisé</option>
          <option value="En attente N+1">En attente N+1</option>
          <option value="En attente Directeur">En attente Directeur</option>
          <option value="En attente DG">En attente DG</option>
          <option value="Prime validée">Validé</option>
          <option value="Prime rejetée">Rejeté</option>
        </select>

        <a
          href="/api/v1/bonuses/export/sage"
          className="btn btn-outline btn-success"
          target="_blank"
          rel="noopener noreferrer"
        >
          Export SAGE PAIE
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employé</th>
              <th>Période</th>
              <th>Type</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.map((bonus) => (
              <tr key={bonus.id}>
                <td>{bonus.id}</td>
                <td>{bonus.employee?.name || 'N/A'}</td>
                <td>
                  {bonus.start_date && bonus.end_date
                    ? `${formatDate(bonus.start_date)} → ${formatDate(bonus.end_date)}`
                    : 'N/A'}
                </td>
                <td>
                  <span className="badge badge-ghost">{bonus.bonus_type}</span>
                </td>
                <td>{bonus.total_amount} Ar</td>
                <td>
                  <span className={
                    bonus.status === 'Prime validée' || bonus.status === 'Validé' ? 'badge badge-success' :
                    bonus.status === 'Prime rejetée' || bonus.status === 'Rejeté' ? 'badge badge-error' :
                    'badge badge-warning'
                  }>
                    {bonus.status}
                  </span>
                </td>
                <td>
                  {bonus.status !== 'Prime validée' && bonus.status !== 'Prime rejetée' && bonus.status !== 'Validé' && bonus.status !== 'Rejeté' && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleValidate(bonus.id, 'N1')}
                    >
                      Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BonusesList;
