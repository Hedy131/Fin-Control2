import { useEffect, useState, useCallback } from 'react'
import { listBudgets, updateBudget } from '../api/budgets.js'
import { getTransactionsSummary } from '../api/transactions.js'
import { listCategories } from '../api/categories.js'
import { listPeriods } from '../api/periods.js'
import BudgetList from '../components/Budgets/BudgetList.jsx'
import BudgetOverview from '../components/Budgets/BudgetOverview.jsx'
import BudgetBottomBar from '../components/Budgets/BudgetBottomBar.jsx'
import Loading from '../components/Common/Loading.jsx'
import { formatPeriodLabel, formatPeriodRange } from '../utils/period.js'
import { useNotifications } from '../context/NotificationContext.jsx'
import { usePeriodContext } from '../context/PeriodContext.jsx'
import useHighlightFromQuery from '../hooks/useHighlightFromQuery.js'

export default function Budgets() {
  const { recheckBudgets } = useNotifications() || {}
  const { periodStart: sharedPeriodStart, periodEnd: sharedPeriodEnd, setResolvedPeriod } = usePeriodContext()
  const highlightId = useHighlightFromQuery()
  const [budgets, setBudgets] = useState([])
  const [summary, setSummary] = useState([])
  const [categories, setCategories] = useState([])
  const [periods, setPeriods] = useState([])
  const [periodStart, setPeriodStart] = useState('')
  const [loading, setLoading] = useState(true)

  const refreshBudgets = useCallback((period) => {
    const start = period?.start || ''
    listBudgets(start ? { period_start: start } : {}).then(setBudgets)
    if (start) {
      const params = { start_date: start }
      if (period.end) params.end_date = period.end
      getTransactionsSummary(params).then((s) => setSummary(s.by_currency))
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([listCategories(), listPeriods(12)])
      .then(([c, p]) => {
        setCategories(c)
        setPeriods(p)
        // carry over whatever period was last selected on the Painel/outra página, instead
        // of always resetting to the current period
        const initial = sharedPeriodStart ? { start: sharedPeriodStart, end: sharedPeriodEnd } : p[p.length - 1]
        setPeriodStart(initial?.start || '')
        if (!sharedPeriodStart && initial) setResolvedPeriod(initial.start, initial.end ?? null)
        return refreshBudgets(initial)
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshBudgets])

  function handlePeriodChange(start) {
    setPeriodStart(start)
    const matched = periods.find((p) => p.start === start)
    refreshBudgets(matched)
    setResolvedPeriod(start, matched?.end ?? null)
  }

  async function handleSave(id, amount) {
    await updateBudget(id, { amount }, periodStart ? { period_start: periodStart } : {})
    refreshBudgets(periods.find((p) => p.start === periodStart))
    recheckBudgets?.()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Orçamentos</h2>
        <select
          value={periodStart}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {periods.map((p) => (
            <option key={p.start} value={p.start}>
              {formatPeriodLabel(p)} {p.start.slice(0, 4)} ({formatPeriodRange(p)})
            </option>
          ))}
        </select>
      </div>
      {categories.filter((c) => c.types.includes('expense')).length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma categoria de despesa para ela aparecer aqui como orçamento.
        </p>
      )}
      <BudgetOverview budgets={budgets} summary={summary} />
      <BudgetList budgets={budgets} categories={categories} onSave={handleSave} highlightId={highlightId} />
      <BudgetBottomBar budgets={budgets} />
    </div>
  )
}
