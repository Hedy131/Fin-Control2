import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '../../utils/currency.js'

function byCurrency(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

function pctChange(current, previous) {
  if (!previous) return null
  return Math.round(((current - previous) / Math.abs(previous)) * 100)
}

export default function BalanceHeroCard({ summary }) {
  const currencies = summary.total_balance_by_currency.map((c) => c.currency)
  const trend = summary.period_trend || []
  const previousPeriod = trend.length >= 2 ? trend[trend.length - 2] : null

  if (currencies.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-white border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-400">Sem contas cadastradas ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {currencies.map((currency) => {
        const totalBalance = byCurrency(summary.total_balance_by_currency, currency)
        const periodIncome = byCurrency(summary.period_income_by_currency, currency)
        const periodExpense = byCurrency(summary.period_expense_by_currency, currency)
        const periodBalance = byCurrency(summary.period_balance_by_currency, currency)
        const previousBalance = previousPeriod ? byCurrency(previousPeriod.balance_by_currency, currency) : null
        const change = pctChange(periodBalance, previousBalance)
        return (
          <div
            key={currency}
            className="rounded-2xl p-6 text-white bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm"
          >
            {currencies.length > 1 && <p className="text-xs font-medium text-primary-100 mb-1">{currency}</p>}
            <p className="text-sm text-primary-100">Saldo Total</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance, currency)}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-sm">
                <ArrowUpRight size={16} className="text-green-300" />
                {formatCurrency(periodIncome, currency)}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <ArrowDownRight size={16} className="text-red-300" />
                {formatCurrency(periodExpense, currency)}
              </div>
              {change != null && (
                <span className={`text-xs font-semibold ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {change >= 0 ? '+' : ''}
                  {change}% vs. período anterior
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
