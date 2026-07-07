import { useEffect, useState } from 'react'
import { getSummary } from '../api/dashboard.js'
import SummaryCards from '../components/Dashboard/SummaryCards.jsx'
import ExpenseChart from '../components/Dashboard/ExpenseChart.jsx'
import IncomeExpenseChart from '../components/Dashboard/IncomeExpenseChart.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch(() => setError('Nao foi possivel carregar o painel.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading />
  if (error) return <p className="text-red-600 text-sm">{error}</p>
  if (!summary) return null

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Painel</h2>
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Despesas por Categoria (mes atual)</h3>
          <ExpenseChart data={summary.expenses_by_category} />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Receitas x Despesas (6 meses)</h3>
          <IncomeExpenseChart data={summary.monthly_trend} />
        </div>
      </div>
    </div>
  )
}
