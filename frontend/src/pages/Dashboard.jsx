import { useEffect, useState } from 'react'
import { getSummary } from '../api/dashboard.js'
import { sortCurrencies } from '../utils/currency.js'
import PeriodSelector from '../components/Dashboard/PeriodSelector.jsx'
import BalanceHeroCard from '../components/Dashboard/BalanceHeroCard.jsx'
import BudgetsMiniSummary from '../components/Dashboard/BudgetsMiniSummary.jsx'
import TopExpenses from '../components/Dashboard/TopExpenses.jsx'
import CompositionDonut from '../components/Dashboard/CompositionDonut.jsx'
import ExpenseChart from '../components/Dashboard/ExpenseChart.jsx'
import Card from '../components/Common/Card.jsx'
import Loading from '../components/Common/Loading.jsx'

function summaryParams(period) {
  if (period.type === 'period') return { period_start: period.value }
  if (period.type === 'year') return { year: period.value }
  return { range: period.value }
}

export default function Dashboard() {
  const [period, setPeriod] = useState({ type: 'preset', value: 'month' })
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getSummary(summaryParams(period))
      .then(setSummary)
      .catch(() => setError('Não foi possível carregar o painel.'))
      .finally(() => setLoading(false))
  }, [period])

  if (loading && !summary) return <Loading />
  if (error) return <p className="text-red-600 text-sm">{error}</p>
  if (!summary) return null

  const currencies = sortCurrencies(summary.total_balance_by_currency.map((c) => c.currency))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Painel</h2>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currencies.map((currency) => (
          <BalanceHeroCard key={currency} summary={summary} currency={currency} />
        ))}
        <BudgetsMiniSummary periodStart={summary.period_start} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopExpenses periodStart={summary.period_start} periodEnd={summary.period_end} />
        <CompositionDonut summary={summary} />
        <Card>
          <p className="text-base font-semibold text-gray-700 mb-3">Despesas por Categoria</p>
          <ExpenseChart data={summary.expenses_by_category} />
        </Card>
      </div>
    </div>
  )
}
