import { formatCurrency } from '../../utils/currency.js'

function byCurrency(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

export default function SummaryCards({ summary }) {
  const currencies = summary.total_balance_by_currency.map((c) => c.currency)

  if (currencies.length === 0) {
    return <p className="text-sm text-gray-400">Sem contas cadastradas ainda.</p>
  }

  return (
    <div className="space-y-4">
      {currencies.map((currency) => {
        const totalBalance = byCurrency(summary.total_balance_by_currency, currency)
        const periodIncome = byCurrency(summary.period_income_by_currency, currency)
        const periodExpense = byCurrency(summary.period_expense_by_currency, currency)
        const periodBalance = byCurrency(summary.period_balance_by_currency, currency)
        const cards = [
          { label: 'Saldo Total', value: totalBalance, color: 'text-gray-900' },
          { label: 'Receitas do Período', value: periodIncome, color: 'text-green-600' },
          { label: 'Despesas do Período', value: periodExpense, color: 'text-red-600' },
          {
            label: 'Saldo do Período',
            value: periodBalance,
            color: periodBalance >= 0 ? 'text-green-600' : 'text-red-600',
          },
        ]
        return (
          <div key={currency}>
            {currencies.length > 1 && <p className="text-xs font-semibold text-gray-400 mb-2">{currency}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card) => (
                <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className={`text-2xl font-bold mt-2 ${card.color}`}>{formatCurrency(card.value, currency)}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
