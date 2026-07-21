import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import ProgressBar from '../Common/ProgressBar.jsx'
import { formatCurrency } from '../../utils/currency.js'

function GoalCard({ goal, category, accounts, onSave }) {
  const navigate = useNavigate()
  const [targetAmount, setTargetAmount] = useState(goal.target_amount)
  const [initialAmount, setInitialAmount] = useState(goal.initial_amount)
  const over = goal.days_remaining !== null && goal.days_remaining !== undefined && goal.days_remaining < 0
  const excess = goal.progress - goal.target_amount

  function saveTargetAmount() {
    if (targetAmount !== goal.target_amount) onSave(goal.id, { target_amount: targetAmount || 0 })
  }

  function saveInitialAmount() {
    if (initialAmount !== goal.initial_amount) onSave(goal.id, { initial_amount: initialAmount || 0 })
  }

  return (
    <div
      onClick={() => navigate(`/transactions?category_id=${goal.category_id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#6366f1' }} />
        <p className="font-semibold text-gray-900">{category?.name || '-'}</p>
      </div>
      <div className="mb-2">
        <ProgressBar
          percent={goal.progress_pct}
          excessText={excess > 0 ? `${formatCurrency(excess, goal.currency)} acima do alvo` : null}
        />
      </div>
      <p className="text-sm text-gray-600">
        {formatCurrency(goal.progress, goal.currency)} de {formatCurrency(goal.target_amount, goal.currency)}
        <span className="text-gray-400"> ({goal.progress_pct}%)</span>
      </p>
      {goal.days_remaining !== null && goal.days_remaining !== undefined && (
        <p className={`text-xs mt-1 ${over ? 'text-red-600' : 'text-gray-400'}`}>
          {over ? 'Prazo ultrapassado' : `${goal.days_remaining} dias restantes`}
        </p>
      )}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        <label className="block text-xs font-medium text-gray-500 mb-1">Valor Alvo</label>
        <CurrencyInput value={targetAmount} onChange={setTargetAmount} onBlur={saveTargetAmount} />
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Prazo</label>
          <input
            type="date"
            value={goal.target_date || ''}
            onChange={(e) => onSave(goal.id, { target_date: e.target.value || null })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Conta Dedicada</label>
          <select
            value={goal.linked_account_id || ''}
            onChange={(e) => onSave(goal.id, { linked_account_id: e.target.value ? parseInt(e.target.value, 10) : null })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Nenhuma — usar transações desta categoria</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        {!goal.linked_account_id && (
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Valor Inicial (antes das transações)</label>
            <CurrencyInput value={initialAmount} onChange={setInitialAmount} onBlur={saveInitialAmount} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function GoalList({ goals, categories, accounts, onSave }) {
  if (goals.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria de poupança cadastrada ainda.</p>
  }

  const categoryFor = (id) => categories.find((c) => c.id === id)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((g) => (
        <GoalCard key={g.id} goal={g} category={categoryFor(g.category_id)} accounts={accounts} onSave={onSave} />
      ))}
    </div>
  )
}
