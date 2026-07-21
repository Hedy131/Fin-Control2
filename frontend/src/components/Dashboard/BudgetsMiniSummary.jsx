import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBudgets } from '../../api/budgets.js'
import ProgressBar from '../Common/ProgressBar.jsx'
import Card from '../Common/Card.jsx'

export default function BudgetsMiniSummary() {
  const [budgets, setBudgets] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    listBudgets().then(setBudgets)
  }, [])

  return (
    <Card onClick={() => navigate('/budgets')} className="h-full">
      <p className="text-sm text-gray-500">Orçamentos</p>
      {budgets === null ? (
        <p className="text-sm text-gray-400 mt-3">A carregar...</p>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-gray-400 mt-3">Sem categorias de despesa cadastradas ainda.</p>
      ) : (
        (() => {
          const withinCount = budgets.filter((b) => b.spent <= b.amount).length
          const totalAmount = budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
          const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0)
          const pct = totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0
          return (
            <>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {withinCount} de {budgets.length} dentro do limite
              </p>
              <div className="mt-4">
                <ProgressBar percent={pct} />
              </div>
            </>
          )
        })()
      )}
    </Card>
  )
}
