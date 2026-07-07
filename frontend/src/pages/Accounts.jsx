import { useEffect, useState } from 'react'
import { listAccounts, createAccount, deleteAccount } from '../api/accounts.js'
import AccountForm from '../components/Accounts/AccountForm.jsx'
import AccountList from '../components/Accounts/AccountList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function refresh() {
    setLoading(true)
    listAccounts().then(setAccounts).finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createAccount(payload)
    setShowForm(false)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta conta e todas as suas transacoes?')) return
    await deleteAccount(id)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Contas</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">
          {showForm ? 'Fechar' : 'Nova Conta'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <AccountForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      <AccountList accounts={accounts} onDelete={handleDelete} />
    </div>
  )
}
