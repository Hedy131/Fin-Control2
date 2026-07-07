import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { CURRENCIES } from '../../utils/currency.js'

const TYPES = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'investment', label: 'Investimento' },
]

export default function AccountForm({ initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name || '')
  const [type, setType] = useState(initialValues?.type || 'checking')
  const [initialBalance, setInitialBalance] = useState(initialValues?.initial_balance ?? 0)
  const [currency, setCurrency] = useState(initialValues?.currency || 'AOA')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ name, type, initial_balance: initialBalance || 0, currency })
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
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
        <CurrencyInput value={initialBalance} onChange={setInitialBalance} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">Salvar</button>
      </div>
    </form>
  )
}
