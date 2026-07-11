import { useState } from 'react'
import { previewImport } from '../../api/imports.js'

export default function ImportForm({ accounts, onExtracted, onCancel }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file || !accountId) return
    setLoading(true)
    setError('')
    try {
      const data = await previewImport(accountId, file)
      onExtracted(parseInt(accountId, 10), data.rows)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Não foi possível extrair as transações deste PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
        <select
          required
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Extrato bancário (PDF)</label>
        <input
          required
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">A analisar o PDF... isto pode demorar até um minuto.</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading || !file} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
          {loading ? 'A extrair...' : 'Extrair'}
        </button>
      </div>
    </form>
  )
}
