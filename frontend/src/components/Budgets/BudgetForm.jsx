import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatPeriodLabel } from '../../utils/period.js'

export default function BudgetForm({ categories, periods, initialValues, onSubmit, onCancel }) {
  const expenseCategories = categories.filter((c) => c.types.includes('expense'))
  const currentPeriod = periods[periods.length - 1]

  const [categoryId, setCategoryId] = useState(initialValues?.category_id || expenseCategories[0]?.id || '')
  const [amount, setAmount] = useState(initialValues?.amount ?? 0)
  const [periodStart, setPeriodStart] = useState(initialValues?.period_start || currentPeriod?.start || '')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      category_id: parseInt(categoryId, 10),
      amount: amount || 0,
      period_start: periodStart,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {expenseCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Limite</label>
        <CurrencyInput required value={amount} onChange={setAmount} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Período Financeiro</label>
        <select required value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
          {periods.map((p) => (
            <option key={p.start} value={p.start}>{formatPeriodLabel(p)}</option>
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
