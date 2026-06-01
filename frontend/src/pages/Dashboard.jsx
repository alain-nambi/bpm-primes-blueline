import { useEffect, useState, useMemo } from 'react';
import { getBonuses, getEmployees } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import { EyeIcon, BonusesIcon, ClockIcon, CheckIcon, UsersIcon, CalendarIcon, MoonIcon, ChartIcon } from '../components/Icons';

const Dashboard = () => {
  const { user } = useAuth();
  const [bonuses, setBonuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [b, e] = await Promise.all([getBonuses(), getEmployees()]);
        setBonuses(b);
        setEmployees(e);
        setLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatAmount = (v) => (v || 0).toLocaleString('fr-FR') + ' Ar';

  const stats = useMemo(() => {
    const total = bonuses.length;
    const totalAmount = bonuses.reduce((s, b) => s + (parseFloat(b.total_amount) || 0), 0);

    const byStatus = {};
    const byType = {};
    for (const b of bonuses) {
      const st = b.status || 'Inconnu';
      byStatus[st] = (byStatus[st] || 0) + 1;
      const tp = b.bonus_type || 'inconnu';
      if (!byType[tp]) byType[tp] = { count: 0, amount: 0 };
      byType[tp].count++;
      byType[tp].amount += parseFloat(b.total_amount) || 0;
    }

    const pending = bonuses.filter(b => b.status !== 'Validé' && b.status !== 'Rejeté').length;
    const validated = byStatus['Validé'] || 0;

    return { total, totalAmount, pending, validated, byStatus, byType, employees: employees.length };
  }, [bonuses, employees]);

  const myPending = useMemo(() => {
    if (!user) return [];
    const myStatuses = [];
    if (user.is_validator_n1) myStatuses.push('Initialisé', 'En attente N+1');
    if (user.is_directeur) myStatuses.push('En attente Directeur');
    if (user.is_dg) myStatuses.push('En attente DG');
    return bonuses.filter(b => myStatuses.includes(b.status));
  }, [bonuses, user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Vue d'ensemble des primes</p>
        </div>
        <div className="flex gap-3">
          <Link to="/bonuses/new" className="btn bg-blue-600 hover:bg-blue-700 text-white border-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nouvelle Prime
          </Link>
          <Link to="/bonuses" className="btn btn-outline btn-sm">Voir les Primes</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<BonusesIcon className="w-6 h-6" />} label="Total Primes" value={stats.total} sub={formatAmount(stats.totalAmount)} color="brand" />
        <StatCard icon={<ClockIcon className="w-6 h-6" />} label="En attente" value={stats.pending} sub="Non validées" color="amber" />
        <StatCard icon={<CheckIcon className="w-6 h-6" />} label="Validées" value={stats.validated} sub="Approuvées" color="emerald" />
        <StatCard icon={<UsersIcon className="w-6 h-6" />} label="Employés" value={stats.employees} sub="Actifs" color="violet" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<CalendarIcon className="w-6 h-6" />} label="Mensuel" value={stats.byType.mensuel?.count || 0} sub={formatAmount(stats.byType.mensuel?.amount)} color="brand" />
        <StatCard icon={<MoonIcon className="w-6 h-6" />} label="Astreinte" value={stats.byType.astreinte?.count || 0} sub={formatAmount(stats.byType.astreinte?.amount)} color="amber" />
        <StatCard icon={<ChartIcon className="w-6 h-6" />} label="Commission" value={stats.byType.commission?.count || 0} sub={formatAmount(stats.byType.commission?.amount)} color="emerald" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <UsersIcon className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">À valider par vous</h2>
          <span className="ml-auto bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">{myPending.length}</span>
        </div>

        {myPending.length === 0 ? (
          <div className="p-10 text-center">
            <CheckIcon className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-gray-500">Aucune prime en attente de votre validation</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 font-medium text-gray-400">Employé</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-400">Type</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-400">Période</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-400">Montant</th>
                  <th className="text-center px-6 py-3 font-medium text-gray-400 w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {myPending.map((bonus, i) => (
                  <tr key={bonus.id} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                    <td className="px-6 py-3 font-medium text-gray-900">{bonus.employee?.name || 'N/A'}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {bonus.bonus_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-400 text-sm">
                      {bonus.start_date && bonus.end_date
                        ? `${formatDate(bonus.start_date)} → ${formatDate(bonus.end_date)}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">{parseFloat(bonus.total_amount).toLocaleString('fr-FR')} Ar</td>
                    <td className="px-6 py-3 text-center">
                      <Link to={`/bonuses/${bonus.id}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium" title="Voir le détail">
                        <EyeIcon className="w-4 h-4" />
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
