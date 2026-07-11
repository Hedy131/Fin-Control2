import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatCurrency, CURRENCIES } from '../../utils/currency.js'

function PositionCard({ position, category, onSave }) {
  const navigate = useNavigate()
  const [currentValue, setCurrentValue] = useState(position.current_value)
  const gainColor = position.gain_loss >= 0 ? 'text-green-600' : 'text-red-600'

  function handleValueBlur() {
    if (currentValue !== position.current_value) {
      onSave(position.id, { current_value: currentValue || 0 })
    }
  }

  function handleCurrencyChange(e) {
    onSave(position.id, { currency: e.target.value })
  }

  return (
    <div
      onClick={() => navigate(`/transactions?category_id=${position.category_id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#6366f1' }} />
        <p className="font-semibold text-gray-900">{category?.name || '-'}</p>
      </div>
      <p className="text-sm text-gray-600">
        Investido: <span className="font-medium text-gray-900">{formatCurrency(position.invested_amount, position.currency)}</span>
      </p>
      <p className={`text-sm font-semibold mt-1 ${gainColor}`}>
        {position.gain_loss >= 0 ? '+' : ''}
        {formatCurrency(position.gain_loss, position.currency)}
        {position.gain_loss_pct !== null && position.gain_loss_pct !== undefined &&
          ` (${position.gain_loss_pct >= 0 ? '+' : ''}${position.gain_loss_pct}%)`}
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Valor Atual</label>
          <CurrencyInput value={currentValue} onChange={setCurrentValue} onBlur={handleValueBlur} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Moeda</label>
          <select
            value={position.currency}
            onChange={handleCurrencyChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default function InvestmentList({ positions, categories, onSave }) {
  if (positions.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria de investimento cadastrada ainda.</p>
  }

  const categoryFor = (id) => categories.find((c) => c.id === id)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {positions.map((p) => (
        <PositionCard key={p.id} position={p} category={categoryFor(p.category_id)} onSave={onSave} />
      ))}
    </div>
  )
}
