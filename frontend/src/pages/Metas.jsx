import { useEffect, useState } from 'react'
import { listGoals, updateGoal } from '../api/goals.js'
import { listCategories } from '../api/categories.js'
import { listAccounts } from '../api/accounts.js'
import GoalList from '../components/Goals/GoalList.jsx'
import Loading from '../components/Common/Loading.jsx'

export default function Metas() {
  const [goals, setGoals] = useState([])
  const [categories, setCategories] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    Promise.all([listGoals(), listCategories(), listAccounts()])
      .then(([g, c, a]) => {
        setGoals(g)
        setCategories(c)
        setAccounts(a)
      })
      .finally(() => setLoading(false))
  }

  useEffect(refresh, [])

  async function handleSave(id, payload) {
    await updateGoal(id, payload)
    refresh()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Metas</h2>
      {categories.filter((c) => c.types.includes('savings')).length === 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Cadastre uma categoria de poupança (em Categorias) para ela aparecer aqui.
        </p>
      )}
      <p className="text-xs text-gray-400">
        O progresso vem de uma conta dedicada (se ligares uma) ou das transações lançadas nesta categoria em Transações.
      </p>
      <GoalList goals={goals} categories={categories} accounts={accounts} onSave={handleSave} />
    </div>
  )
}
