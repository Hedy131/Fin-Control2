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
  const periodInvestment = byCurrency(summary.period_investment_by_currency, currency)
  const periodSavings = byCurrency(summary.period_savings_by_currency, currency)
  const periodCrossTransfer = byCurrency(summary.period_cross_currency_transfer_by_currency, currency)
  const periodBalance = byCurrency(summary.period_balance_by_currency, currency)
  const previousBalance = previousPeriod ? byCurrency(previousPeriod.balance_by_currency, currency) : null
  const change = pctChange(periodBalance, previousBalance)

  const invested = periodInvestment + periodCrossTransfer
  const totalOutflow = periodExpense + periodInvestment + periodSavings + periodCrossTransfer

  return (
    <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
      <p className="text-sm text-primary-100">Saldo Total {currency}</p>
      <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance, currency)}</p>

      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center gap-2">
          <p className="text-xs text-primary-100">Saldo Mensal</p>
          {change != null && (
            <span className={`text-xs font-semibold ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
          )}
        </div>
        <p className="text-lg font-semibold mt-0.5">{formatCurrency(periodBalance, currency)}</p>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <ArrowUpRight size={16} className="text-green-300" />
            {formatCurrency(periodIncome, currency)}
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight size={16} className="text-red-300" />
            {formatCurrency(periodExpense, currency)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20">
        <div>
          <p className="text-xs text-primary-100">Investido</p>
          <p className="text-sm font-semibold mt-0.5">{formatCurrency(invested, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-primary-100">Poupado</p>
          <p className="text-sm font-semibold mt-0.5">{formatCurrency(periodSavings, currency)}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/20">
        <p className="text-xs text-primary-100">Despesas + Investimentos + Poupanças + Transferências</p>
        <p className="text-lg font-bold text-red-300 mt-0.5">{formatCurrency(totalOutflow, currency)}</p>
      </div>
    </div>
  )
}
