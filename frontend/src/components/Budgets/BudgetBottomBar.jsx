import { AlertTriangle, Target } from 'lucide-react'
import { formatCurrency } from '../../utils/currency.js'

export default function BudgetBottomBar({ budgets }) {
  if (!budgets || budgets.length === 0) return null

  const totalExcess = budgets.reduce((sum, b) => sum + Math.max(0, (b.spent || 0) - (b.amount || 0)), 0)
  const totalRemaining = budgets.reduce((sum, b) => sum + Math.max(0, (b.amount || 0) - (b.spent || 0)), 0)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
      <div className="flex items-center gap-3 flex-1 py-2 sm:py-0 sm:pr-5">
        <AlertTriangle size={18} className="text-red-600 shrink-0" />
        <div>
          <p className="text-xs font-medium text-gray-400">Total Excedente</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(totalExcess)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-1 py-2 sm:py-0 sm:pl-5">
        <Target size={18} className="text-green-600 shrink-0" />
        <div>
          <p className="text-xs font-medium text-gray-400">Total para Atingir o Limite</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalRemaining)}</p>
        </div>
      </div>
    </div>
  )
}
