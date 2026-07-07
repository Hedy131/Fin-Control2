import { useEffect, useState } from 'react'
import { listBudgets, createBudget, updateBudget, deleteBudget } from '../api/budgets.js'
import { listCategories } from '../api/categories.js'
import { listPeriods } from '../api/periods.js'
import BudgetForm from '../components/Budgets/BudgetForm.jsx'
import BudgetList from '../components/Budgets/BudgetList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Budgets() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formInitialValues, setFormInitialValues] = useState(null)
  const [editingId, setEditingId] = useState(null)

  function refresh() {
    setLoading(true)
    Promise.all([listBudgets(), listCategories(), listPeriods(12)])
      .then(([b, c, p]) => {
        setBudgets(b)
        setCategories(c)
        setPeriods(p)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  function openCreateForm() {
    setFormInitialValues(null)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(budget) {
    setFormInitialValues(budget)
    setEditingId(budget.id)
    setShowForm(true)
  }

  function openDuplicateForm(budget) {
    const currentPeriod = periods[periods.length - 1]
    setFormInitialValues({ ...budget, period_start: currentPeriod?.start || budget.period_start })
    setEditingId(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setFormInitialValues(null)
    setEditingId(null)
  }

  async function handleSubmit(payload) {
    if (editingId) {
      await updateBudget(editingId, payload)
    } else {
      await createBudget(payload)
    }
    closeForm()
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover este orçamento?')) return
    await deleteBudget(id)
    refresh()
  }

  const expenseCategories = categories.filter((c) => c.types.includes('expense'))

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Orçamentos</h2>
        <button
          onClick={() => (showForm ? closeForm() : openCreateForm())}
          disabled={expenseCategories.length === 0}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50"
        >
          {showForm ? 'Fechar' : 'Novo Orçamento'}
        </button>
      </div>
      {expenseCategories.length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma categoria de despesa antes de criar orçamentos.
        </p>
      )}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <BudgetForm
            categories={categories}
            periods={periods}
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={closeForm}
          />
        </div>
      )}
      <BudgetList
        budgets={budgets}
        categories={categories}
        onEdit={openEditForm}
        onDuplicate={openDuplicateForm}
        onDelete={handleDelete}
      />
    </div>
  )
}
