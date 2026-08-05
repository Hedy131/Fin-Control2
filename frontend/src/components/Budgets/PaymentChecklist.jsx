import { useEffect, useState } from 'react'
import { Check, Pencil, Trash2, Plus, X } from 'lucide-react'
import {
  listChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from '../../api/paymentChecklist.js'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { formatCurrency } from '../../utils/currency.js'

const EMPTY_FORM = { name: '', amount: 0, category_id: '' }

function ChecklistItemForm({ categories, initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues || EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!values.name.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        amount: values.amount || 0,
        category_id: values.category_id ? parseInt(values.category_id, 10) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 rounded-lg p-3 mb-3">
      <input
        type="text"
        required
        autoFocus
        value={values.name}
        onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        placeholder="Ex: Pagar Empregada"
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
      />
      <CurrencyInput
        value={values.amount}
        onChange={(amount) => setValues((v) => ({ ...v, amount }))}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
      />
      <select
        value={values.category_id ?? ''}
        onChange={(e) => setValues((v) => ({ ...v, category_id: e.target.value }))}
        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
      >
        <option value="">Sem categoria (marcação manual não disponível)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function PaymentChecklist({ categories, periodStart, periodEnd }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState(null) // null | 'new' | itemId

  function refresh() {
    setLoading(true)
    const params = periodStart ? { period_start: periodStart, ...(periodEnd ? { period_end: periodEnd } : {}) } : {}
    listChecklistItems(params).then(setItems).finally(() => setLoading(false))
  }

  useEffect(refresh, [periodStart, periodEnd])

  async function handleCreate(payload) {
    await createChecklistItem(payload)
    setFormMode(null)
    refresh()
  }

  async function handleUpdate(id, payload) {
    await updateChecklistItem(id, payload)
    setFormMode(null)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover este pagamento da lista?')) return
    await deleteChecklistItem(id)
    refresh()
  }

  const paidCount = items.filter((i) => i.paid).length
  const remainingTotal = items.filter((i) => !i.paid).reduce((sum, i) => sum + (i.amount || 0), 0)
  const editingItem = typeof formMode === 'number' ? items.find((i) => i.id === formMode) : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">CheckList de Pagamentos</h3>
        {formMode === null && (
          <button
            onClick={() => setFormMode('new')}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus size={14} /> Adicionar
          </button>
        )}
        {formMode !== null && (
          <button onClick={() => setFormMode(null)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>

      {formMode === 'new' && (
        <ChecklistItemForm categories={categories} onSubmit={handleCreate} onCancel={() => setFormMode(null)} />
      )}
      {editingItem && (
        <ChecklistItemForm
          categories={categories}
          initialValues={{
            name: editingItem.name,
            amount: editingItem.amount,
            category_id: editingItem.category_id ?? '',
          }}
          onSubmit={(payload) => handleUpdate(editingItem.id, payload)}
          onCancel={() => setFormMode(null)}
        />
      )}

      {!loading && items.length === 0 && formMode === null && (
        <p className="text-sm text-gray-400">Nenhum pagamento na lista ainda.</p>
      )}

      <ul className="space-y-1 flex-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} className="group flex items-center gap-2 py-1.5">
            <span
              className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center ${
                item.paid ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}
              title={item.paid ? 'Detetado numa transação deste período' : 'Ainda sem transação correspondente este período'}
            >
              {item.paid && <Check size={12} className="text-white" />}
            </span>
            <span className={`text-sm flex-1 truncate ${item.paid ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {item.name}
            </span>
            <span className="text-xs text-gray-500 shrink-0">{formatCurrency(item.amount)}</span>
            <div className="hidden group-hover:flex gap-1 shrink-0">
              <button onClick={() => setFormMode(item.id)} className="text-gray-400 hover:text-primary-600">
                <Pencil size={12} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={12} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          {paidCount} de {items.length} pagos — falta {formatCurrency(remainingTotal)}
        </p>
      )}
    </div>
  )
}
