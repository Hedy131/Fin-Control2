import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'
import { confirmImport } from '../../api/imports.js'

function toRowState(row, index) {
  return {
    key: index,
    included: true,
    date: row.date,
    description: row.description,
    amount: row.amount,
    type: row.type,
    category_id: row.suggested_category_id ?? '',
  }
}

export default function ImportReview({ accountId, rows: initialRows, categories, onImported, onCancel }) {
  const [rows, setRows] = useState(() => initialRows.map(toRowState))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateRow(key, changes) {
    setRows((current) =>
      current.map((r) => {
        if (r.key !== key) return r
        const next = { ...r, ...changes }
        if (changes.type && changes.type !== r.type) next.category_id = ''
        return next
      })
    )
  }

  const includedCount = rows.filter((r) => r.included).length

  async function handleConfirm() {
    const selected = rows.filter((r) => r.included)
    if (selected.length === 0) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        account_id: accountId,
        transactions: selected.map((r) => ({
          date: r.date,
          description: r.description,
          amount: r.amount || 0,
          type: r.type,
          category_id: r.category_id ? parseInt(r.category_id, 10) : null,
        })),
      }
      const result = await confirmImport(payload)
      onImported(result.created)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Não foi possível gravar as transações.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Reveja as transações extraídas antes de gravar. Desmarque as que não quer importar.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto border border-gray-100 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-3 py-2 text-left"></th>
              <th className="px-3 py-2 text-left">Data</th>
              <th className="px-3 py-2 text-left">Descrição</th>
              <th className="px-3 py-2 text-left">Valor</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Categoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const filteredCategories = categories.filter((c) => c.types.includes(row.type))
              return (
                <tr key={row.key} className={row.included ? '' : 'opacity-40'}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={(e) => updateRow(row.key, { included: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.key, { date: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-36"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.description}
                      onChange={(e) => updateRow(row.key, { description: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-56"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <CurrencyInput
                      value={row.amount}
                      onChange={(v) => updateRow(row.key, { amount: v })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-28"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.key, { type: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      {TRANSACTION_TYPES.filter((t) => t.value === 'income' || t.value === 'expense').map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={row.category_id}
                      onChange={(e) => updateRow(row.key, { category_id: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">Sem categoria</option>
                      {filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={saving} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={saving || includedCount === 0}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          {saving ? 'A gravar...' : `Confirmar e Importar (${includedCount})`}
        </button>
      </div>
    </div>
  )
}
