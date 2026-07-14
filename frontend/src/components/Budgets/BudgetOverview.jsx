import { formatCurrency } from '../../utils/currency.js'

export default function BudgetOverview({ budgets }) {
  if (!budgets || budgets.length === 0) return null

  const totalExcess = budgets.reduce((sum, b) => sum + Math.max(0, (b.spent || 0) - (b.amount || 0)), 0)
  const totalRemaining = budgets.reduce((sum, b) => sum + Math.max(0, (b.amount || 0) - (b.spent || 0)), 0)
  const diff = totalExcess - totalRemaining

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-400 mb-1">Total Excedente</p>
        <p className="text-lg font-bold text-red-600">{formatCurrency(totalExcess)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-400 mb-1">Total para Atingir o Limite</p>
        <p className="text-lg font-bold text-green-600">{formatCurrency(totalRemaining)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-400 mb-1">Diferença (Excedente − Falta)</p>
        <p className={`text-lg font-bold ${diff > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(diff)}
        </p>
      </div>
    </div>
  )
}
