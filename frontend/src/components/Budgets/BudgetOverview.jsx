import { Wallet, PiggyBank, TrendingUp, ShoppingBag, Coins } from 'lucide-react'
import { formatCurrency } from '../../utils/currency.js'

function amountLabel(byCurrency, key) {
  const parts = (byCurrency || []).filter((row) => (row[key] || 0) > 0)
  if (parts.length === 0) return formatCurrency(0)
  return parts.map((row) => formatCurrency(row[key], row.currency)).join(' + ')
}

function Card({ label, value, className, tinted, Icon, iconClassName }) {
  return (
    <div
      className={`rounded-xl p-4 ${
        tinted ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={16} className={iconClassName || 'text-gray-400'} />}
        <p className="text-xs font-medium text-gray-400">{label}</p>
      </div>
      <p className={`text-lg font-bold ${className || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

export default function BudgetOverview({ budgets, summary }) {
  if (!budgets || budgets.length === 0) return null

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const totalExcess = budgets.reduce((sum, b) => sum + Math.max(0, (b.spent || 0) - (b.amount || 0)), 0)
  const totalRemaining = budgets.reduce((sum, b) => sum + Math.max(0, (b.amount || 0) - (b.spent || 0)), 0)
  const availableToSpend = totalRemaining - totalExcess

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Orçamento" value={formatCurrency(totalBudget)} tinted Icon={Wallet} iconClassName="text-primary-600" />
        <Card
          label="Poupanças"
          value={amountLabel(summary, 'savings')}
          className="text-emerald-600"
          tinted
          Icon={PiggyBank}
          iconClassName="text-emerald-600"
        />
        <Card
          label="Investimentos"
          value={amountLabel(summary, 'investment')}
          className="text-blue-600"
          tinted
          Icon={TrendingUp}
          iconClassName="text-blue-600"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          label="Despesas"
          value={amountLabel(summary, 'expense')}
          className="text-red-600"
          Icon={ShoppingBag}
          iconClassName="text-red-600"
        />
        <Card
          label="Tenho para gastar"
          value={formatCurrency(availableToSpend)}
          tinted
          className={availableToSpend >= 0 ? 'text-green-600' : 'text-red-600'}
          Icon={Coins}
          iconClassName={availableToSpend >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>
    </div>
  )
}
