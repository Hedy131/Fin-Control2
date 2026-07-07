import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { CURRENCIES } from '../../utils/currency.js'

export default function GoalForm({ accounts, initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || '')
  const [targetAmount, setTargetAmount] = useState(initialValues?.target_amount ?? 0)
  const [currency, setCurrency] = useState(initialValues?.currency || 'AOA')
  const [targetDate, setTargetDate] = useState(initialValues?.target_date || '')
  const [linkedAccountId, setLinkedAccountId] = useState(initialValues?.linked_account_id ?? '')
  const [manualCurrentAmount, setManualCurrentAmount] = useState(initialValues?.manual_current_amount ?? 0)
  const [color, setColor] = useState(initialValues?.color || '#6366f1')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      name,
      target_amount: targetAmount || 0,
      currency,
      target_date: targetDate || null,
      linked_account_id: linkedAccountId ? parseInt(linkedAccountId, 10) : null,
      manual_current_amount: linkedAccountId ? null : manualCurrentAmount || 0,
      color,
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Alvo</label>
        <CurrencyInput required value={targetAmount} onChange={setTargetAmount} />
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (opcional)</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conta Dedicada (opcional)</label>
        <select value={linkedAccountId} onChange={(e) => setLinkedAccountId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Nenhuma — usar valor manual</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      {!linkedAccountId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor Atual</label>
          <CurrencyInput value={manualCurrentAmount} onChange={setManualCurrentAmount} />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10 rounded-lg border border-gray-300" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">Salvar</button>
      </div>
    </form>
  )
}
