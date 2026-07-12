import { useState } from 'react'
import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'

export default function BulkEditBar({ selectedCount, accounts, categories, onApply, onDelete }) {
  const [type, setType] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [applying, setApplying] = useState(false)

  if (selectedCount === 0) return null

  const filteredCategories = type ? categories.filter((c) => c.types.includes(type)) : categories

  function handleTypeChange(value) {
    setType(value)
    setCategoryId('')
  }

  async function handleApply() {
    if (!type && !accountId && !categoryId) return
    setApplying(true)
    try {
      const payload = {}
      if (type) payload.type = type
      if (accountId) payload.account_id = parseInt(accountId, 10)
      if (categoryId) payload.category_id = parseInt(categoryId, 10)
      await onApply(payload)
      setType('')
      setAccountId('')
      setCategoryId('')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex flex-wrap items-end gap-3">
      <p className="text-sm font-medium text-primary-800 mr-2">{selectedCount} selecionada(s)</p>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
        <select value={type} onChange={(e) => handleTypeChange(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Não alterar</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Conta</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Não alterar</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Categoria</label>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm">
          <option value="">Não alterar</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={handleApply}
        disabled={applying || (!type && !accountId && !categoryId)}
        className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
      >
        {applying ? 'A aplicar...' : 'Aplicar'}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="px-4 py-2 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
      >
        Remover selecionadas
      </button>
    </div>
  )
}
