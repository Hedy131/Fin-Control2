import { useState } from 'react'
import { previewImport } from '../../api/imports.js'

export default function ImportForm({ onExtracted, onCancel }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await previewImport(file)
      onExtracted(data.rows)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Não foi possível ler este ficheiro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Folha de cálculo (.xlsx)</label>
        <input
          required
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          Colunas esperadas: Data | Descrição | Valor | Tipo | Conta | Categoria (opcional; para
          transferências, adicione também uma coluna Conta Destino).
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">A ler o ficheiro...</p>}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading || !file} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
          {loading ? 'A ler...' : 'Ler ficheiro'}
        </button>
      </div>
    </form>
  )
}
