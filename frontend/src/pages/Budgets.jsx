import { useEffect, useState } from 'react'
import { listBudgets, createBudget, deleteBudget } from '../api/budgets.js'
import { listCategories } from '../api/categories.js'
import BudgetForm from '../components/Budgets/BudgetForm.jsx'
import BudgetList from '../components/Budgets/BudgetList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  function refresh() {
    setLoading(true)
    Promise.all([listBudgets(), listCategories()])
      .then(([b, c]) => {
        setBudgets(b)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createBudget(payload)
    setShowForm(false)
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover este orcamento?')) return
    await deleteBudget(id)
    refresh()
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Orcamentos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          disabled={expenseCategories.length === 0}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          {showForm ? 'Fechar' : 'Novo Orcamento'}
        </button>
      </div>
      {expenseCategories.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma categoria de despesa antes de criar orcamentos.
        </p>
      )}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <BudgetForm categories={categories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      <BudgetList budgets={budgets} categories={categories} onDelete={handleDelete} />
    </div>
  )
}
