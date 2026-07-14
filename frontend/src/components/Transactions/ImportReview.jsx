import { useState } from 'react'
import CurrencyInput from '../Common/CurrencyInput.jsx'
import { TRANSACTION_TYPES } from '../../utils/categoryTypes.js'
import { confirmImport } from '../../api/imports.js'
import { extractErrorMessage } from '../../utils/errors.js'

function toRowState(row, index) {
  return {
    key: index,
    included: row.valid,
    error: row.error,
    date: row.date || '',
    description: row.description || '',
    amount: row.amount || 0,
    type: row.type || 'expense',
    account_id: row.account_id ?? '',
    destination_account_id: row.destination_account_id ?? '',
    category_id: row.category_id ?? '',
  }
}

export default function ImportReview({ rows: initialRows, accounts, categories, onImported, onCancel }) {
  const [rows, setRows] = useState(() => initialRows.map(toRowState))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateRow(key, changes) {
    setRows((current) =>
      current.map((r) => {
        if (r.key !== key) return r
        const next = { ...r, ...changes }
        if (changes.type && changes.type !== r.type) next.category_id = ''
        if (changes.type && changes.type !== 'transfer') next.destination_account_id = ''
        return next
      })
    )
  }

  const readyRows = rows.filter((r) => r.included && r.account_id && r.date)
  const includedCount = readyRows.length

  async function handleConfirm() {
    if (readyRows.length === 0) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        transactions: readyRows.map((r) => ({
          date: r.date,
          description: r.description,
          amount: r.amount || 0,
          type: r.type,
          account_id: parseInt(r.account_id, 10),
          destination_account_id: r.type === 'transfer' && r.destination_account_id ? parseInt(r.destination_account_id, 10) : null,
          category_id: r.category_id ? parseInt(r.category_id, 10) : null,
        })),
      }
      const result = await confirmImport(payload)
      onImported(result.created)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível gravar as transações.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Reveja as transações lidas do ficheiro antes de gravar. Linhas a vermelho têm um problema
        (conta, categoria, data ou valor) — corrija ou desmarque-as.
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
              <th className="px-3 py-2 text-left">Conta</th>
              <th className="px-3 py-2 text-left">Conta Destino</th>
              <th className="px-3 py-2 text-left">Categoria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const filteredCategories = categories.filter((c) => c.types.includes(row.type))
              const destinationOptions = accounts.filter((a) => String(a.id) !== String(row.account_id))
              const rowHasError = !row.account_id || !row.date
              return (
                <tr key={row.key} className={!row.included ? 'opacity-40' : rowHasError || row.error ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={(e) => updateRow(row.key, { included: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.key, { date: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-36"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      value={row.description}
                      onChange={(e) => updateRow(row.key, { description: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-48"
                    />
                    {row.error && <p className="text-xs text-red-600 mt-1">{row.error}</p>}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <CurrencyInput
                      value={row.amount}
                      onChange={(v) => updateRow(row.key, { amount: v })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm w-28"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.key, { type: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      {TRANSACTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={row.account_id}
                      onChange={(e) => updateRow(row.key, { account_id: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      <option value="">Selecione...</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {row.type === 'transfer' && (
                      <select
                        value={row.destination_account_id}
                        onChange={(e) => updateRow(row.key, { destination_account_id: e.target.value })}
                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {destinationOptions.map((a) => (
                          <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
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
