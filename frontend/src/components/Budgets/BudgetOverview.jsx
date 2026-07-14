import { formatCurrency } from '../../utils/currency.js'

function amountLabel(byCurrency, key) {
  const parts = (byCurrency || []).filter((row) => (row[key] || 0) > 0)
  if (parts.length === 0) return formatCurrency(0)
  return parts.map((row) => formatCurrency(row[key], row.currency)).join(' + ')
}

function Card({ label, value, className }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-bold ${className || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

export default function BudgetOverview({ budgets, summary }) {
  if (!budgets || budgets.length === 0) return null

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalExcess = budgets.reduce((sum, b) => sum + Math.max(0, (b.spent || 0) - (b.amount || 0)), 0)
  const totalRemaining = budgets.reduce((sum, b) => sum + Math.max(0, (b.amount || 0) - (b.spent || 0)), 0)
  const rawDiff = totalExcess - totalRemaining
  const diff = rawDiff < 0 ? rawDiff * -1 : rawDiff

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Despesas" value={amountLabel(summary, 'expense')} className="text-red-600" />
        <Card label="Investimentos" value={amountLabel(summary, 'investment')} className="text-blue-600" />
        <Card label="Poupanças" value={amountLabel(summary, 'savings')} className="text-emerald-600" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Orçamento" value={formatCurrency(totalBudget)} />
        <Card label="Total Excedente" value={formatCurrency(totalExcess)} className="text-red-600" />
        <Card label="Total para Atingir o Limite" value={formatCurrency(totalRemaining)} className="text-green-600" />
        <Card label="Diferença (Excedente − Falta)" value={formatCurrency(diff)} className="text-red-600" />
      </div>
    </div>
  )
}
