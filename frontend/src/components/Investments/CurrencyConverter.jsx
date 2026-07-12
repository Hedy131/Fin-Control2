import { useEffect, useState } from 'react'
import { getFxRates } from '../../api/fx.js'
import { FX_CURRENCIES } from '../../utils/fxCurrencies.js'

export default function CurrencyConverter() {
  const [from, setFrom] = useState('AOA')
  const [to, setTo] = useState('USD')
  const [amount, setAmount] = useState(1)
  const [rates, setRates] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getFxRates(from)
      .then((data) => {
        setRates(data.rates)
        setUpdatedAt(data.updated_at)
      })
      .catch(() => setError('Não foi possível obter as taxas de câmbio.'))
      .finally(() => setLoading(false))
  }, [from])

  function swap() {
    setFrom(to)
    setTo(from)
  }

  const rate = rates ? rates[to] : null
  const result = rate ? amount * rate : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversor de Moeda</h3>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {FX_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={swap}
          title="Trocar moedas"
          className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          ⇄
        </button>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Para</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
            {FX_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {loading && <p className="text-sm text-gray-400">A obter taxas de câmbio...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && result !== null && (
          <p className="text-lg font-semibold text-gray-900">
            {amount.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} {from} ={' '}
            {result.toLocaleString('pt-PT', { maximumFractionDigits: 2 })} {to}
          </p>
        )}
        {!loading && !error && rate && (
          <p className="text-xs text-gray-400 mt-1">
            1 {from} = {rate.toLocaleString('pt-PT', { maximumFractionDigits: 6 })} {to}
            {updatedAt && ` · atualizado ${updatedAt}`}
          </p>
        )}
      </div>
    </div>
  )
}
