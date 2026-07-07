import { useEffect, useState } from 'react'
import { listTransactions, createTransaction, deleteTransaction } from '../api/transactions.js'
import { listAccounts } from '../api/accounts.js'
import { listCategories } from '../api/categories.js'
import TransactionForm from '../components/Transactions/TransactionForm.jsx'
import TransactionList from '../components/Transactions/TransactionList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function refresh() {
    setLoading(true)
    Promise.all([listTransactions(), listAccounts(), listCategories()])
      .then(([t, a, c]) => {
        setTransactions(t)
        setAccounts(a)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createTransaction(payload)
    setShowForm(false)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta transacao?')) return
    await deleteTransaction(id)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Transacoes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={accounts.length === 0}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          {showForm ? 'Fechar' : 'Nova Transacao'}
        </button>
      </div>
      {accounts.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma conta antes de lancar transacoes.
        </p>
      )}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      <TransactionList
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        onDelete={handleDelete}
      />
    </div>
  )
}
