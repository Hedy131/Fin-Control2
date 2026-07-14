import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'

function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}

export default function TransactionForm({ accounts, categories, initialValues, onSubmit, onCancel }) {
  const [accountId, setAccountId] = useState(initialValues?.account_id ?? accounts[0]?.id ?? '')
  const [destinationAccountId, setDestinationAccountId] = useState(initialValues?.destination_account_id ?? '')
  const [categoryId, setCategoryId] = useState(initialValues?.category_id ?? '')
  const [type, setType] = useState(initialValues?.type || 'expense')
  const [amount, setAmount] = useState(initialValues?.amount ?? 0)
  const [description, setDescription] = useState(initialValues?.description || '')
  const [date, setDate] = useState(initialValues?.date || new Date().toISOString().slice(0, 10))
  const [time, setTime] = useState(initialValues?.time?.slice(0, 5) || nowTime())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleTypeChange(nextType) {
    setType(nextType)
    setCategoryId('')
    if (nextType !== 'transfer') setDestinationAccountId('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        account_id: parseInt(accountId, 10),
        destination_account_id: type === 'transfer' && destinationAccountId ? parseInt(destinationAccountId, 10) : null,
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        type,
        amount: amount || 0,
        description,
        date,
        time: time ? `${time}:00` : null,
      })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Não foi possível gravar a transação.')
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter((c) => c.types.includes(type))
  const destinationOptions = accounts.filter((a) => String(a.id) !== String(accountId))
  const sourceAccount = accounts.find((a) => String(a.id) === String(accountId))
  const destAccount = accounts.find((a) => String(a.id) === String(destinationAccountId))
  const showCurrencyWarning =
    type === 'transfer' && sourceAccount && destAccount && sourceAccount.currency !== destAccount.currency

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select value={type} onChange={(e) => handleTypeChange(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conta {type === 'transfer' ? 'de Origem' : ''}</label>
        <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
          ))}
        </select>
      </div>
      {type === 'transfer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Conta de Destino</label>
          <select required value={destinationAccountId} onChange={(e) => setDestinationAccountId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {destinationOptions.map((a) => (
              <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
            ))}
          </select>
          {showCurrencyWarning && (
            <p className="text-xs text-amber-600 mt-1">
              Contas com moedas diferentes — o valor será movido sem conversão.
            </p>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Sem categoria</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
        <CurrencyInput required value={amount} onChange={setAmount} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
          {saving ? 'A gravar...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
