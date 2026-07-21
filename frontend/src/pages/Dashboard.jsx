import { useEffect, useState } from 'react'
import { getSummary } from '../api/dashboard.js'
import PeriodPills from '../components/Dashboard/PeriodPills.jsx'
import BalanceHeroCard from '../components/Dashboard/BalanceHeroCard.jsx'
import BudgetsMiniSummary from '../components/Dashboard/BudgetsMiniSummary.jsx'
import RecentTransactions from '../components/Dashboard/RecentTransactions.jsx'
import EarningsTrendChart from '../components/Dashboard/EarningsTrendChart.jsx'
import CompositionDonut from '../components/Dashboard/CompositionDonut.jsx'
import ExpenseChart from '../components/Dashboard/ExpenseChart.jsx'
import Card from '../components/Common/Card.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Dashboard() {
  const [range, setRange] = useState('month')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getSummary(range)
      .then(setSummary)
      .catch(() => setError('Não foi possível carregar o painel.'))
      .finally(() => setLoading(false))
  }, [range])

  if (loading && !summary) return <Loading />
  if (error) return <p className="text-red-600 text-sm">{error}</p>
  if (!summary) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Painel</h2>
        <PeriodPills value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceHeroCard summary={summary} />
        <BudgetsMiniSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />
        <div className="space-y-6">
          <EarningsTrendChart data={summary.period_trend} />
          <CompositionDonut summary={summary} />
        </div>
      </div>

      <Card>
        <p className="text-sm font-semibold text-gray-700 mb-4">Despesas por Categoria</p>
        <ExpenseChart data={summary.expenses_by_category} />
      </Card>
    </div>
  )
}
