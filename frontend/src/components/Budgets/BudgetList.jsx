import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatCurrency } from '../../utils/currency.js'

function BudgetCard({ budget, categoryName, onSave }) {
  const navigate = useNavigate()
  const [amount, setAmount] = useState(budget.amount)
  const pct = budget.amount > 0 ? Math.min(100, Math.round((budget.spent / budget.amount) * 100)) : 0
  const over = budget.spent > budget.amount

  function handleBlur() {
    if (amount !== budget.amount) onSave(budget.id, amount || 0)
  }

  return (
    <div
      onClick={() => navigate(`/transactions?category_id=${budget.category_id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200"
    >
      <p className="font-semibold text-gray-900 mb-3">{categoryName}</p>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${over ? 'bg-red-500' : 'bg-primary-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mb-3">{formatCurrency(budget.spent)} gastos</p>
      <div onClick={(e) => e.stopPropagation()}>
        <label className="block text-xs font-medium text-gray-500 mb-1">Valor Limite</label>
        <CurrencyInput value={amount} onChange={setAmount} onBlur={handleBlur} />
      </div>
    </div>
  )
}

export default function BudgetList({ budgets, categories, onSave }) {
  if (budgets.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria de despesa cadastrada ainda.</p>
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '-'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((b) => (
        <BudgetCard key={b.id} budget={b} categoryName={categoryName(b.category_id)} onSave={onSave} />
      ))}
    </div>
  )
}
