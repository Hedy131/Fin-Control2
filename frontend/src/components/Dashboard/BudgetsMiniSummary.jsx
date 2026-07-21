import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBudgets } from '../../api/budgets.js'
import { listCategories } from '../../api/categories.js'
import ProgressBar from '../Common/ProgressBar.jsx'
import Card from '../Common/Card.jsx'

export default function BudgetsMiniSummary({ periodStart }) {
  const [budgets, setBudgets] = useState(null)
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setBudgets(null)
    Promise.all([listBudgets(periodStart ? { period_start: periodStart } : {}), listCategories()]).then(
      ([b, c]) => {
        setBudgets(b)
        setCategories(c)
      }
    )
  }, [periodStart])

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '-'

  const top3 = (budgets || [])
    .filter((b) => b.amount > 0)
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount)
    .slice(0, 3)

  return (
    <Card onClick={() => navigate('/budgets')} className="h-full">
      <p className="text-base text-gray-500 mb-3">Orçamentos perto do limite</p>
      {budgets === null ? (
        <p className="text-sm text-gray-400">A carregar...</p>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-gray-400">Sem categorias de despesa cadastradas ainda.</p>
      ) : top3.length === 0 ? (
        <p className="text-sm text-gray-400">Sem limites definidos ainda.</p>
      ) : (
        <div className="space-y-3">
          {top3.map((b) => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0
            return (
              <div key={b.id}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="truncate">{categoryName(b.category_id)}</span>
                  <span className={pct > 100 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <ProgressBar percent={pct} />
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
