import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { createBonus, getEmployees } from '../services/api'

const typeConfig = {
  mensuel: { title: 'Prime Mensuelle', icon: '📅' },
  astreinte: { title: "Prime d'Astreinte", icon: '🌙' },
  commission: { title: 'Prime Commission', icon: '📈' },
}

export default function BonusForm() {
  const { type } = useParams()
  const navigate = useNavigate()
  const config = typeConfig[type]
  const today = new Date().toISOString().split('T')[0]

  const [employees, setEmployees] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(null)

  const [employee, setEmployee] = useState({
    department: '', service: '', name: '', function: '', matricule: '',
  })
  const [manager, setManager] = useState({ name: '', function: '' })
  const [params, setParams] = useState({ startDate: today, endDate: today, maxPrime: 150000 })
  const [observation, setObservation] = useState('')
  const [applyToAll, setApplyToAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [quantitative, setQuantitative] = useState([
    { criteria: 'Planification du travail', description: '', objective: '20%', evaluation: 0, value: 0 },
    { criteria: 'Respect des deadlines', description: '', objective: '20%', evaluation: 0, value: 0 },
    { criteria: "Capacité d'analyse", description: '', objective: '20%', evaluation: 0, value: 0 },
    { criteria: 'Respect des deadlines (doublon)', description: '', objective: '10%', evaluation: 0, value: 0 },
    { criteria: 'Exécution des tâches périodiques', description: '', objective: '30%', evaluation: 0, value: 0 },
  ])
  const [qualitative, setQualitative] = useState([
    { criteria: 'Qualité du travail', description: '', objective: '40%', evaluation: 0, value: 0 },
    { criteria: 'Initiative', description: '', objective: '30%', evaluation: 0, value: 0 },
    { criteria: "Travail d'équipe", description: '', objective: '30%', evaluation: 0, value: 0 },
  ])

  const [simpleForm, setSimpleForm] = useState({
    employee_id: '', start_date: today, end_date: today, total_amount: '',
    nb_jours_astreinte: '', taux_jour: '', prime_astreinte_amount: '',
    ca_realise: '', ca_objectif: '', taux_commission: '', commission_amount: '',
  })

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {})
  }, [])

  const totalQuantitative = quantitative.reduce((s, i) => s + i.value, 0)
  const totalQualitative = qualitative.reduce((s, i) => s + i.value, 0)
  const totalEval = totalQuantitative + totalQualitative
  const remaining = params.maxPrime - totalEval
  const overBudget = totalEval > params.maxPrime

  if (!config) {
    return (
      <div className="page-container">
        <div className="card-blueline p-8 text-center">
          <p className="text-base-content/60">Type de prime invalide.</p>
          <Link to="/bonuses/new" className="btn bg-brand-600 hover:bg-brand-700 text-white border-0 mt-4">Retour</Link>
        </div>
      </div>
    )
  }

  const handleEvalChange = (list, setter, index, field, value, maxPrime) => {
    const newData = [...list]
    if (field === 'evaluation') {
      const pct = parseFloat(value) || 0
      newData[index].evaluation = pct
      newData[index].value = (pct / 100) * maxPrime
    } else {
      newData[index][field] = value
    }
    setter(newData)
  }

  const handleSimpleChange = (e) => setSimpleForm({ ...simpleForm, [e.target.name]: e.target.value })

  const handleSelectEmployee = (e) => {
    const id = parseInt(e.target.value)
    const emp = employees.find((x) => x.id === id)
    setSelectedEmp(emp)
    setSimpleForm({ ...simpleForm, employee_id: id })
    if (emp) {
      setEmployee({ department: emp.department || '', service: '', name: emp.name, function: '', matricule: emp.matricule })
    }
  }

  const handleSubmitMensuel = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const amount = Math.min(totalEval, params.maxPrime)
    try {
      await createBonus({
        employee_id: selectedEmp?.id,
        start_date: params.startDate,
        end_date: params.endDate,
        bonus_type: 'mensuel',
        performance_score: (totalEval / params.maxPrime) * 100,
        total_amount: amount,
      })
      navigate('/bonuses')
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSimple = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        employee_id: parseInt(simpleForm.employee_id),
        start_date: simpleForm.start_date,
        end_date: simpleForm.end_date,
        bonus_type: type,
        total_amount: parseFloat(simpleForm.total_amount),
      }
      const extraFields = type === 'astreinte'
        ? ['nb_jours_astreinte', 'taux_jour', 'prime_astreinte_amount']
        : ['ca_realise', 'ca_objectif', 'taux_commission', 'commission_amount']
      for (const f of extraFields) {
        if (simpleForm[f]) payload[f] = parseFloat(simpleForm[f])
      }
      await createBonus(payload)
      navigate('/bonuses')
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la création")
    } finally {
      setLoading(false)
    }
  }

  const renderField = (name, label, placeholder, step = 'any') => (
    <div key={name}>
      <label className="block text-sm font-medium text-base-content/70 mb-1">{label}</label>
      <input type="number" step={step} name={name} value={simpleForm[name]} onChange={handleSimpleChange}
        className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
        placeholder={placeholder} />
    </div>
  )

  if (type !== 'mensuel') {
    return (
      <div className="page-container max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/bonuses/new" className="p-2 rounded-lg hover:bg-base-200"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link>
          <div><h1 className="page-title">{config.icon} {config.title}</h1><p className="text-sm text-base-content/50">Remplissez les informations ci-dessous</p></div>
        </div>
        <form onSubmit={handleSubmitSimple} className="space-y-6">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">⚠️ {error}</div>}
          <div className="card-blueline p-6 space-y-4">
            <h2 className="font-semibold">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Employé</label>
                <select name="employee_id" value={simpleForm.employee_id} onChange={handleSimpleChange} required
                  className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500">
                  <option value="">Sélectionner...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.matricule})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Montant total (Ar)</label>
                <input type="number" step="0.01" name="total_amount" value={simpleForm.total_amount} onChange={handleSimpleChange} required
                  className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Date début</label>
                <input type="date" name="start_date" value={simpleForm.start_date} onChange={handleSimpleChange} required
                  className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Date fin</label>
                <input type="date" name="end_date" value={simpleForm.end_date} onChange={handleSimpleChange} required
                  className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
            </div>
          </div>
          <div className="card-blueline p-6 space-y-4">
            <h2 className="font-semibold">Détails {config.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'astreinte' && (
                <>{renderField('nb_jours_astreinte', "Jours d'astreinte", 'Ex: 5', '1')}{renderField('taux_jour', 'Taux journalier (Ar)', 'Ex: 30000')}{renderField('prime_astreinte_amount', "Montant astreinte (Ar)", 'Ex: 150000')}</>
              )}
              {type === 'commission' && (
                <>{renderField('ca_realise', 'CA réalisé (Ar)', 'Ex: 50000000')}{renderField('ca_objectif', 'CA objectif (Ar)', 'Ex: 100000000')}{renderField('taux_commission', 'Taux commission (%)', 'Ex: 2.5')}{renderField('commission_amount', 'Montant commission (Ar)', 'Ex: 1250000')}</>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn bg-brand-600 hover:bg-brand-700 text-white border-0">{loading ? <span className="loading loading-spinner" /> : 'Créer la prime'}</button>
            <Link to="/bonuses/new" className="btn btn-ghost">Annuler</Link>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="page-container max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/bonuses/new" className="p-2 rounded-lg hover:bg-base-200"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></Link>
        <div><h1 className="page-title">📅 Prime Mensuelle</h1><p className="text-sm text-base-content/50">Établissement des primes mensuelles</p></div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">⚠️ {error}</div>}

      <form onSubmit={handleSubmitMensuel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card-blueline p-6">
            <h2 className="font-semibold text-base-content mb-4">Informations de l'employé</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Employé</label>
                <select value={selectedEmp?.id || ''} onChange={handleSelectEmployee}
                  className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500">
                  <option value="">Sélectionner...</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.matricule})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Département</label>
                <input type="text" value={employee.department} readOnly className="w-full px-3 py-2 rounded-lg border border-base-200 bg-base-100 text-base-content/60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Nom et prénom</label>
                <input type="text" value={employee.name} readOnly className="w-full px-3 py-2 rounded-lg border border-base-200 bg-base-100 text-base-content/60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Matricule</label>
                <input type="text" value={employee.matricule} readOnly className="w-full px-3 py-2 rounded-lg border border-base-200 bg-base-100 text-base-content/60" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Service</label>
                <input type="text" value={employee.service} onChange={(e) => setEmployee({ ...employee, service: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
            </div>
          </div>

          <div className="card-blueline p-6">
            <h2 className="font-semibold text-base-content mb-4">Responsable & Période</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Nom du responsable</label>
                <input type="text" value={manager.name} onChange={(e) => setManager({ ...manager, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Fonction</label>
                <input type="text" value={manager.function} onChange={(e) => setManager({ ...manager, function: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Date début</label>
                  <input type="date" value={params.startDate} onChange={(e) => setParams({ ...params, startDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content/70 mb-1">Date fin</label>
                  <input type="date" value={params.endDate} onChange={(e) => setParams({ ...params, endDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content/70 mb-1">Prime maximum (Ar)</label>
                <input type="number" value={params.maxPrime} onChange={(e) => setParams({ ...params, maxPrime: parseFloat(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-blueline p-6 mb-6">
          <h2 className="font-semibold text-base-content mb-4">Évaluation Quantitative</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-200">
                  <th className="text-left py-2 px-2 font-medium text-base-content/60">Critères</th>
                  <th className="text-left py-2 px-2 font-medium text-base-content/60">Description/Obs</th>
                  <th className="text-center py-2 px-2 font-medium text-base-content/60">Objectif</th>
                  <th className="text-center py-2 px-2 font-medium text-base-content/60">Évaluation %</th>
                  <th className="text-right py-2 px-2 font-medium text-base-content/60">Valeur (Ar)</th>
                </tr>
              </thead>
              <tbody>
                {quantitative.map((item, i) => (
                  <tr key={i} className="border-b border-base-100">
                    <td className="py-2 px-2 font-medium">{item.criteria}</td>
                    <td className="py-2 px-2">
                      <input type="text" value={item.description} onChange={(e) => handleEvalChange(quantitative, setQuantitative, i, 'description', e.target.value, params.maxPrime)}
                        className="w-full px-2 py-1 rounded border border-base-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm" />
                    </td>
                    <td className="py-2 px-2 text-center">{item.objective}</td>
                    <td className="py-2 px-2 text-center">
                      <input type="number" value={item.evaluation} onChange={(e) => handleEvalChange(quantitative, setQuantitative, i, 'evaluation', e.target.value, params.maxPrime)}
                        className="w-20 px-2 py-1 rounded border border-base-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm text-center" />
                    </td>
                    <td className="py-2 px-2 text-right font-medium">{item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="font-semibold border-t-2 border-brand-200">
                  <td colSpan="4" className="py-2 px-2 text-right">Total Quantitatif</td>
                  <td className="py-2 px-2 text-right text-brand-600">{totalQuantitative.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-blueline p-6 mb-6">
          <h2 className="font-semibold text-base-content mb-4">Évaluation Qualitative</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-200">
                  <th className="text-left py-2 px-2 font-medium text-base-content/60">Critères</th>
                  <th className="text-left py-2 px-2 font-medium text-base-content/60">Description/Obs</th>
                  <th className="text-center py-2 px-2 font-medium text-base-content/60">Objectif</th>
                  <th className="text-center py-2 px-2 font-medium text-base-content/60">Évaluation %</th>
                  <th className="text-right py-2 px-2 font-medium text-base-content/60">Valeur (Ar)</th>
                </tr>
              </thead>
              <tbody>
                {qualitative.map((item, i) => (
                  <tr key={i} className="border-b border-base-100">
                    <td className="py-2 px-2 font-medium">{item.criteria}</td>
                    <td className="py-2 px-2">
                      <input type="text" value={item.description} onChange={(e) => handleEvalChange(qualitative, setQualitative, i, 'description', e.target.value, params.maxPrime)}
                        className="w-full px-2 py-1 rounded border border-base-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm" />
                    </td>
                    <td className="py-2 px-2 text-center">{item.objective}</td>
                    <td className="py-2 px-2 text-center">
                      <input type="number" value={item.evaluation} onChange={(e) => handleEvalChange(qualitative, setQualitative, i, 'evaluation', e.target.value, params.maxPrime)}
                        className="w-20 px-2 py-1 rounded border border-base-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-sm text-center" />
                    </td>
                    <td className="py-2 px-2 text-right font-medium">{item.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="font-semibold border-t-2 border-brand-200">
                  <td colSpan="4" className="py-2 px-2 text-right">Total Qualitatif</td>
                  <td className="py-2 px-2 text-right text-brand-600">{totalQualitative.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-blueline p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-base-content/60 text-sm">Note de calcul : Total = total valeur quantitative + total valeur qualitative</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-base-content/60">Période : {params.startDate} → {params.endDate}</span>
              </div>
              <div className="mt-3 w-full max-w-xs">
                <div className="flex justify-between text-xs text-base-content/50 mb-1">
                  <span>Budget utilisé</span>
                  <span>{Math.min(totalEval, params.maxPrime).toLocaleString()} / {params.maxPrime.toLocaleString()} Ar</span>
                </div>
                <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${overBudget ? 'bg-red-500' : totalEval > params.maxPrime * 0.8 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min((totalEval / params.maxPrime) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-base-content/60">Total</p>
              <p className={`text-2xl font-bold ${overBudget ? 'text-red-600' : 'text-brand-600'}`}>
                {totalEval.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} Ar
              </p>
              {remaining >= 0 ? (
                <p className="text-xs text-emerald-600">Restant : {remaining.toLocaleString()} Ar</p>
              ) : (
                <p className="text-xs text-red-600">Dépassé de {Math.abs(remaining).toLocaleString()} Ar</p>
              )}
            </div>
          </div>
          {overBudget && (
            <div className="mt-3 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-2">
              ⚠️ Le total dépasse le plafond maximum de {params.maxPrime.toLocaleString()} Ar. Ajustez les évaluations.
            </div>
          )}
        </div>

        <div className="card-blueline p-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} className="checkbox checkbox-sm border-base-300 rounded [--chkbg:theme(colors.brand.600)] checked:border-brand-600" />
              <span className="text-sm text-base-content/70">Appliquer ce modèle à tous mes équipes</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-base-content/70 mb-1">Observations générales</label>
              <textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none"
                placeholder="Ajouter des notes ou observations..." />
            </div>
            <div className="flex gap-3 justify-end">
              <Link to="/bonuses/new" className="btn btn-ghost">Annuler</Link>
              <button type="submit" disabled={loading} className="btn bg-brand-600 hover:bg-brand-700 text-white border-0">
                {loading ? <span className="loading loading-spinner" /> : 'Valider/Suivant'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
