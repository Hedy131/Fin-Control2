import { useState } from 'react'

export default function BudgetForm({ categories, onSubmit, onCancel }) {
  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const today = new Date()
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [year, setYear] = useState(today.getFullYear())

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      category_id: parseInt(categoryId, 10),
      amount: parseFloat(amount),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
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
        <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
          <input required type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <input required type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">Salvar</button>
      </div>
    </form>
  )
}
