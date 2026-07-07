import { useEffect, useState } from 'react'
import { listGoals, createGoal, updateGoal, deleteGoal } from '../api/goals.js'
import { listAccounts } from '../api/accounts.js'
import GoalForm from '../components/Goals/GoalForm.jsx'
import GoalList from '../components/Goals/GoalList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Metas() {
  const [goals, setGoals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)

  function refresh() {
    setLoading(true)
    Promise.all([listGoals(), listAccounts()])
      .then(([g, a]) => {
        setGoals(g)
        setAccounts(a)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleCreate(payload) {
    await createGoal(payload)
    setShowForm(false)
    refresh()
  }

  async function handleUpdate(payload) {
    await updateGoal(editingGoal.id, payload)
    setEditingGoal(null)
    refresh()
  }

  async function handleUpdateProgress(id, manualCurrentAmount) {
    await updateGoal(id, { manual_current_amount: manualCurrentAmount })
    refresh()
  }

  async function handleDelete(id) {
    if (!confirm('Remover esta meta?')) return
    await deleteGoal(id)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Metas</h2>
        <button
          onClick={() => {
            setEditingGoal(null)
            setShowForm(!showForm)
          }}
          className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white"
        >
          {showForm ? 'Fechar' : 'Nova Meta'}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <GoalForm accounts={accounts} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {editingGoal && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-w-md">
          <GoalForm
            accounts={accounts}
            initialValues={editingGoal}
            onSubmit={handleUpdate}
            onCancel={() => setEditingGoal(null)}
          />
        </div>
      )}
      <GoalList
        goals={goals}
        onEdit={setEditingGoal}
        onUpdateProgress={handleUpdateProgress}
        onDelete={handleDelete}
      />
    </div>
  )
}
