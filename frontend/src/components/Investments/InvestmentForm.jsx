import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { CURRENCIES } from '../../utils/currency.js'
import { INVESTMENT_TYPES } from '../../utils/investmentTypes.js'

export default function InvestmentForm({ initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || '')
  const [type, setType] = useState(initialValues?.type || 'outro')
  const [currency, setCurrency] = useState(initialValues?.currency || 'AOA')
  const [investedAmount, setInvestedAmount] = useState(initialValues?.invested_amount ?? 0)
  const [currentValue, setCurrentValue] = useState(initialValues?.current_value ?? 0)
  const [notes, setNotes] = useState(initialValues?.notes || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      name,
      type,
      currency,
      invested_amount: investedAmount || 0,
      current_value: currentValue || 0,
      notes: notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {INVESTMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Investido</label>
        <CurrencyInput value={investedAmount} onChange={setInvestedAmount} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual</label>
        <CurrencyInput value={currentValue} onChange={setCurrentValue} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">Salvar</button>
      </div>
    </form>
  )
}
