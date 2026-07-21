import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../utils/currency.js'

function byCurrency(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

function pctChange(current, previous) {
  if (!previous) return null
  return Math.round(((current - previous) / Math.abs(previous)) * 100)
}

export default function BalanceHeroCard({ summary, currency }) {
  const trend = summary.period_trend || []
  const previousPeriod = trend.length >= 2 ? trend[trend.length - 2] : null

  const totalBalance = byCurrency(summary.total_balance_by_currency, currency)
  const periodIncome = byCurrency(summary.period_income_by_currency, currency)
  const periodExpense = byCurrency(summary.period_expense_by_currency, currency)
  const periodBalance = byCurrency(summary.period_balance_by_currency, currency)
  const previousBalance = previousPeriod ? byCurrency(previousPeriod.balance_by_currency, currency) : null
  const change = pctChange(periodBalance, previousBalance)

  return (
    <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
      <p className="text-xs text-primary-100">Saldo Total {currency}</p>
      <p className="text-2xl font-bold mt-1">{formatCurrency(totalBalance, currency)}</p>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <div className="flex items-center gap-1 text-xs">
          <ArrowUpRight size={14} className="text-green-300" />
          {formatCurrency(periodIncome, currency)}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <ArrowDownRight size={14} className="text-red-300" />
          {formatCurrency(periodExpense, currency)}
        </div>
        {change != null && (
          <span className={`text-[11px] font-semibold ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {change >= 0 ? '+' : ''}
            {change}%
          </span>
        )}
      </div>
    </div>
  )
}
