import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import ProgressBar from '../Common/ProgressBar.jsx'
import CategoryAvatar from '../Common/CategoryAvatar.jsx'
import { formatCurrency } from '../../utils/currency.js'

function BudgetCard({ budget, category, onSave }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(budget.amount)
  const pct = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0
  const excess = budget.spent - budget.amount

  function handleBlur() {
    if (amount !== budget.amount) onSave(budget.id, amount || 0)
    setEditing(false)
  }

  function handleOpen() {
    const params = new URLSearchParams({ category_id: budget.category_id })
    if (budget.period_start) params.set('period_start', budget.period_start)
    if (budget.period_end) params.set('period_end', budget.period_end)
    navigate(`/transactions?${params.toString()}`)
  }

  return (
    <div
      onClick={handleOpen}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <CategoryAvatar category={category} size="sm" />
        <p className="font-semibold text-gray-900 text-sm truncate" title={category?.name}>
          {category?.name || '-'}
        </p>
      </div>
      <div className="mb-2">
        <ProgressBar percent={pct} excessText={excess > 0 ? `${formatCurrency(excess)} acima do limite` : null} />
      </div>
      <p className="text-xs text-gray-600 mb-3">{formatCurrency(budget.spent)} gastos</p>
      <div onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-medium text-gray-500 mb-1">Valor Limite</p>
        {editing ? (
          <CurrencyInput
            value={amount}
            onChange={setAmount}
            onBlur={handleBlur}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
          />
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{formatCurrency(budget.amount)}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0"
            >
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BudgetList({ budgets, categories, onSave }) {
  if (budgets.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria de despesa cadastrada ainda.</p>
  }

  const categoryFor = (id) => categories.find((c) => c.id === id)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {budgets.map((b) => (
        <BudgetCard key={b.id} budget={b} category={categoryFor(b.category_id)} onSave={onSave} />
      ))}
    </div>
  )
}
