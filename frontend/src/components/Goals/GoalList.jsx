import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatCurrency } from '../../utils/currency.js'

function QuickUpdateProgress({ goal, onUpdateProgress }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(goal.manual_current_amount || 0)

  if (goal.linked_account_id) return null

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-xs text-primary-600 hover:text-primary-700">
        Atualizar progresso
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <CurrencyInput value={value} onChange={setValue} className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs" />
      <button
        onClick={() => {
          onUpdateProgress(goal.id, value)
          setEditing(false)
        }}
        className="text-xs text-primary-600 hover:text-primary-700"
      >
        Guardar
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-700">
        Cancelar
      </button>
    </div>
  )
}

export default function GoalList({ goals, onEdit, onUpdateProgress, onDelete }) {
  if (goals.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma meta cadastrada.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {goals.map((g) => {
        const over = g.days_remaining !== null && g.days_remaining !== undefined && g.days_remaining < 0
        return (
          <div key={g.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                <p className="font-semibold text-gray-900">{g.name}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(g)} className="text-xs text-primary-600 hover:text-primary-700">
                  Editar
                </button>
                <button onClick={() => onDelete(g.id)} className="text-xs text-red-500 hover:text-red-700">
                  Remover
                </button>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full bg-primary-500"
                style={{ width: `${Math.min(100, g.progress_pct || 0)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(g.progress, g.currency)} de {formatCurrency(g.target_amount, g.currency)}
              <span className="text-gray-400"> ({g.progress_pct}%)</span>
            </p>
            {g.days_remaining !== null && g.days_remaining !== undefined && (
              <p className={`text-xs mt-1 ${over ? 'text-red-600' : 'text-gray-400'}`}>
                {over ? 'Prazo ultrapassado' : `${g.days_remaining} dias restantes`}
              </p>
            )}
            <div className="mt-2">
              <QuickUpdateProgress goal={g} onUpdateProgress={onUpdateProgress} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
