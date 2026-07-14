import { useState } from 'react'
import { changePin } from '../api/auth.js'
import { extractErrorMessage } from '../utils/errors.js'

export default function Senha() {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function digitsOnly(value) {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPin.length !== 4) {
      setError('O novo PIN tem de ter 4 dígitos.')
      return
    }
    if (newPin !== confirmPin) {
      setError('A confirmação não coincide com o novo PIN.')
      return
    }

    setLoading(true)
    try {
      await changePin(currentPin, newPin)
      setSuccess(true)
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch (err) {
      setError(extractErrorMessage(err, 'Não foi possível alterar o PIN.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Senha</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PIN atual</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) => setCurrentPin(digitsOnly(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Novo PIN (4 dígitos)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(digitsOnly(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar novo PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(digitsOnly(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">PIN alterado com sucesso.</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
          >
            {loading ? 'A guardar...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  )
}
