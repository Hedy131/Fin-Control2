import { useState } from 'react'
import { exportTransactions } from '../../api/transactions.js'
import { extractErrorMessage } from '../../utils/errors.js'

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function ExportPanel({ filters, onCancel }) {
  const [startDate, setStartDate] = useState(filters?.start_date || '')
  const [endDate, setEndDate] = useState(filters?.end_date || '')
  const [loading, setLoading] = useState(null) // 'xlsx' | 'pdf' | null
  const [error, setError] = useState('')

  async function handleExport(format) {
    if (!startDate || !endDate) {
      setError('Escolha a data inicial e final do período a exportar.')
      return
    }
    setError('')
    setLoading(format)
    try {
      const params = { start_date: startDate, end_date: endDate }
      if (filters?.account_id) params.account_id = filters.account_id
      if (filters?.category_id) params.category_id = filters.category_id
      if (filters?.type) params.type = filters.type
      const blob = await exportTransactions(format, params)
      downloadBlob(blob, `transacoes_${startDate}_${endDate}.${format}`)
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível exportar as transações.'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Exportar Transações</h3>
        <p className="text-xs text-gray-400">Escolha o período a exportar.</p>
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleExport('xlsx')}
          disabled={loading !== null}
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50"
        >
          {loading === 'xlsx' ? 'A exportar...' : 'Exportar .xlsx'}
        </button>
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          className="flex-1 px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          {loading === 'pdf' ? 'A exportar...' : 'Exportar .pdf'}
        </button>
      </div>
      <button type="button" onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">
        Fechar
      </button>
    </div>
  )
}
