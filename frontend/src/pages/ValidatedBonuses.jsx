import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBonuses } from '../services/api';
import { ArrowLeftIcon, CalendarIcon, MoonIcon, ChartIcon } from '../components/Icons';

const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', {
  day: '2-digit', month: 'short', year: 'numeric',
});

const typeIcon = (t) => {
  if (t === 'mensuel') return CalendarIcon;
  if (t === 'astreinte') return MoonIcon;
  if (t === 'commission') return ChartIcon;
  return CalendarIcon;
};

const typeBadge = (t) => {
  const map = {
    mensuel: 'bg-blue-100 text-blue-700',
    astreinte: 'bg-violet-100 text-violet-700',
    commission: 'bg-amber-100 text-amber-700',
  };
  return map[t] || 'bg-gray-100 text-gray-700';
};

const typeLetter = (t) => t === 'mensuel' ? 'M' : t === 'astreinte' ? 'A' : 'C';

const ValidatedBonuses = () => {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBonuses('Prime validée', null, null)
      .then(setBonuses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthGroups = (() => {
    const groups = {};
    bonuses.forEach(b => {
      const ym = b.start_date ? b.start_date.slice(0, 7) : 'inconnu';
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(b);
    });
    return Object.keys(groups).sort().reverse().map(ym => {
      const [y, m] = ym.split('-');
      const monthName = new Date(parseInt(y), parseInt(m) - 1)
        .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      return { ym, monthName, items: groups[ym] };
    });
  })();

  if (loading) {
    return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeftIcon className="w-5 h-5 text-gray-500" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Primes validées</h1>
      </div>

      {monthGroups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">Aucune prime validée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {monthGroups.map(({ ym, monthName, items }) => (
            <div key={ym} className="bg-gray-50 rounded-xl border border-gray-200 border-t-4 border-t-emerald-400 flex flex-col">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">{monthName}</span>
                <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="flex-1 p-3 space-y-2">
                {items.map(b => {
                  const Icon = typeIcon(b.bonus_type);
                  return (
                    <Link key={b.id} to={`/bonuses/${b.id}`}
                      className="block bg-white rounded-lg border border-gray-200 p-3 hover:border-emerald-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${typeBadge(b.bonus_type)}`}>
                          {typeLetter(b.bonus_type)}
                        </span>
                        <span className="text-xs font-medium text-gray-900 truncate">{b.employee?.name || 'N/A'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{formatDate(b.start_date)} → {formatDate(b.end_date)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Prime validée</span>
                        <span className="text-xs font-semibold text-blue-600">{b.total_amount.toLocaleString('fr-FR')} Ar</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidatedBonuses;
