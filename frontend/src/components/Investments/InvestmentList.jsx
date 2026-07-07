import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatCurrency } from '../../utils/currency.js'
import { INVESTMENT_TYPE_LABEL } from '../../utils/investmentTypes.js'

function QuickUpdateValue({ position, onUpdateValue }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(position.current_value)

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="text-xs text-primary-600 hover:text-primary-700">
        Atualizar valor
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <CurrencyInput value={value} onChange={setValue} className="w-28 rounded-lg border border-gray-300 px-2 py-1 text-xs" />
      <button
        onClick={() => {
          onUpdateValue(position.id, value)
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

export default function InvestmentList({ positions, onEdit, onUpdateValue, onDelete }) {
  if (positions.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma posição de investimento cadastrada.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {positions.map((p) => {
        const gainColor = p.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'
        return (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">{INVESTMENT_TYPE_LABEL[p.type] || p.type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(p)} className="text-xs text-primary-600 hover:text-primary-700">
                  Editar
                </button>
                <button onClick={() => onDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">
                  Remover
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Investido: <span className="font-medium text-gray-900">{formatCurrency(p.invested_amount, p.currency)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Atual: <span className="font-medium text-gray-900">{formatCurrency(p.current_value, p.currency)}</span>
            </p>
            <p className={`text-sm font-semibold mt-1 ${gainColor}`}>
              {p.gain_loss >= 0 ? '+' : ''}{formatCurrency(p.gain_loss, p.currency)}
              {p.gain_loss_pct !== null && p.gain_loss_pct !== undefined && ` (${p.gain_loss_pct >= 0 ? '+' : ''}${p.gain_loss_pct}%)`}
            </p>
            <QuickUpdateValue position={p} onUpdateValue={onUpdateValue} />
          </div>
        )
      })}
    </div>
  )
}
