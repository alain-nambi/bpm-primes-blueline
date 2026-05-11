import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBonus } from '../services/api';

const BonusForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [employee, setEmployee] = useState({
    department: '',
    service: '',
    name: '',
    function: '',
    matricule: '',
  });

  const [manager, setManager] = useState({
    name: '',
    function: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const [params, setParams] = useState({
    startDate: today,
    endDate: today,
    maxPrime: 150000,
  });

  const [quantitative, setQuantitative] = useState([
    { criteria: 'Planification du travail', description: '', objective: '20%', evaluation: 0, value: 0 },
    { criteria: 'Respect des deadlines', description: '', objective: '30%', evaluation: 0, value: 0 },
    { criteria: 'Capacité d\'analyse', description: '', objective: '25%', evaluation: 0, value: 0 },
    { criteria: 'Autres', description: '', objective: '25%', evaluation: 0, value: 0 },
  ]);

  const [qualitative, setQualitative] = useState([
    { criteria: 'Qualité du travail', description: '', objective: '40%', evaluation: 0, value: 0 },
    { criteria: 'Initiative', description: '', objective: '30%', evaluation: 0, value: 0 },
    { criteria: 'Travail d\'équipe', description: '', objective: '30%', evaluation: 0, value: 0 },
  ]);

  const [applyToAll, setApplyToAll] = useState(false);
  const [observation, setObservation] = useState('');

  const totalQuantitative = quantitative.reduce((sum, item) => sum + item.value, 0);
  const totalQualitative = qualitative.reduce((sum, item) => sum + item.value, 0);
  const total = totalQuantitative + totalQualitative;

  const handleQuantitativeChange = (index, field, value) => {
    const newData = [...quantitative];
    if (field === 'evaluation') {
      const evalPercent = parseFloat(value) || 0;
      newData[index][field] = evalPercent;
      newData[index].value = (evalPercent / 100) * params.maxPrime;
    } else {
      newData[index][field] = value;
    }
    setQuantitative(newData);
  };

  const handleQualitativeChange = (index, field, value) => {
    const newData = [...qualitative];
    if (field === 'evaluation') {
      const evalPercent = parseFloat(value) || 0;
      newData[index][field] = evalPercent;
      newData[index].value = (evalPercent / 100) * params.maxPrime;
    } else {
      newData[index][field] = value;
    }
    setQualitative(newData);
  };

  const handleSubmit = async (action) => {
    setLoading(true);
    try {
      const bonusData = {
        employee_id: 1,
        start_date: params.startDate,
        end_date: params.endDate,
        bonus_type: 'mensuel',
        performance_score: (total / params.maxPrime) * 100,
        total_amount: total,
      };

      await createBonus(bonusData);
      alert(`Prime ${action === 'next' ? 'enregistrée' : 'validée'} avec succès !`);
      navigate('/bonuses');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Établissement des Primes Mensuelles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-primary">Informations de l'employé</h2>
            <div className="form-control">
              <label className="label"><span className="label-text">Département</span></label>
              <select
                className="select select-bordered"
                value={employee.department}
                onChange={(e) => setEmployee({...employee, department: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                <option value="DSI">DSI</option>
                <option value="BBS">BBS</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Service</span></label>
              <input type="text" className="input input-bordered" value={employee.service} onChange={(e) => setEmployee({...employee, service: e.target.value})} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Nom et prénom</span></label>
              <input type="text" className="input input-bordered" value={employee.name} onChange={(e) => setEmployee({...employee, name: e.target.value})} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Fonction</span></label>
              <input type="text" className="input input-bordered" value={employee.function} onChange={(e) => setEmployee({...employee, function: e.target.value})} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Matricule</span></label>
              <input type="text" className="input input-bordered" value={employee.matricule} onChange={(e) => setEmployee({...employee, matricule: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-secondary">Informations du Responsable</h2>
            <div className="form-control">
              <label className="label"><span className="label-text">Nom et prénom</span></label>
              <input type="text" className="input input-bordered" value={manager.name} onChange={(e) => setManager({...manager, name: e.target.value})} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Fonction</span></label>
              <input type="text" className="input input-bordered" value={manager.function} onChange={(e) => setManager({...manager, function: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <h2 className="card-title">Paramètres de la Prime</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Date début</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={params.startDate}
                onChange={(e) => setParams({...params, startDate: e.target.value})}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Date fin</span></label>
              <input
                type="date"
                className="input input-bordered"
                value={params.endDate}
                onChange={(e) => setParams({...params, endDate: e.target.value})}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Prime maximum (Ar)</span></label>
              <input type="number" className="input input-bordered" value={params.maxPrime} onChange={(e) => setParams({...params, maxPrime: parseFloat(e.target.value)})} />
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <h2 className="card-title">Évaluation Quantitative</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Critères</th>
                  <th>Description/Obs</th>
                  <th>Objectif à atteindre</th>
                  <th>Évaluation %</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                {quantitative.map((item, index) => (
                  <tr key={index}>
                    <td>{item.criteria}</td>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full"
                        value={item.description}
                        onChange={(e) => handleQuantitativeChange(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>{item.objective}</td>
                    <td>
                      <input
                        type="number"
                        className="input input-sm input-bordered w-20"
                        value={item.evaluation}
                        onChange={(e) => handleQuantitativeChange(index, 'evaluation', e.target.value)}
                      />
                    </td>
                    <td>{item.value.toFixed(2)} Ar</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="4">Total Quantitative</td>
                  <td>{totalQuantitative.toFixed(2)} Ar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <h2 className="card-title">Évaluation Qualitative</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Critères</th>
                  <th>Description/Obs</th>
                  <th>Objectif à atteindre</th>
                  <th>Évaluation %</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                {qualitative.map((item, index) => (
                  <tr key={index}>
                    <td>{item.criteria}</td>
                    <td>
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full"
                        value={item.description}
                        onChange={(e) => handleQualitativeChange(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>{item.objective}</td>
                    <td>
                      <input
                        type="number"
                        className="input input-sm input-bordered w-20"
                        value={item.evaluation}
                        onChange={(e) => handleQualitativeChange(index, 'evaluation', e.target.value)}
                      />
                    </td>
                    <td>{item.value.toFixed(2)} Ar</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="4">Total Qualitative</td>
                  <td>{totalQualitative.toFixed(2)} Ar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg mb-8">
        <div className="card-body">
          <div className="alert alert-info mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Période : {params.startDate} → {params.endDate}</span>
          </div>

          <div className="form-control mb-4">
            <label className="cursor-pointer label">
              <span className="label-text">Appliquer ce modèle à tous mes équipes</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
              />
            </label>
          </div>

          <div className="form-control mb-4">
            <label className="label"><span className="label-text">Observations générales</span></label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Ajouter des notes ou observations..."
            ></textarea>
          </div>

          <div className="card-actions justify-end">
            <button
              className="btn btn-outline"
              onClick={() => handleSubmit('next')}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Valider/Suivant'}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmit('validate')}
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Valider tout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusForm;
