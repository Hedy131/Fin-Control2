import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import Card from '../Common/Card.jsx'
import { formatCurrency } from '../../utils/currency.js'

function byCurrency(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

const SLICES = [
  { key: 'expense', name: 'Despesas', color: '#ef4444' },
  { key: 'investment', name: 'Investimentos', color: '#6366f1' },
  { key: 'savings', name: 'Poupanças', color: '#10b981' },
]

export default function CompositionDonut({ summary }) {
  const currencies = summary.total_balance_by_currency.map((c) => c.currency)

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-700 mb-4">Composição do Período</p>
      {currencies.length === 0 ? (
        <p className="text-sm text-gray-400">Sem dados ainda.</p>
      ) : (
        <div className="space-y-6">
          {currencies.map((currency) => {
            const byKey = {
              expense: byCurrency(summary.period_expense_by_currency, currency),
              investment: byCurrency(summary.period_investment_by_currency, currency),
              savings: byCurrency(summary.period_savings_by_currency, currency),
            }
            const data = SLICES.map((s) => ({ name: s.name, value: byKey[s.key], color: s.color })).filter(
              (d) => d.value > 0
            )

            if (data.length === 0) {
              return (
                <p key={currency} className="text-sm text-gray-400">
                  Sem despesas, investimentos ou poupanças neste período{currencies.length > 1 ? ` (${currency})` : ''}.
                </p>
              )
            }

            return (
              <div key={currency}>
                {currencies.length > 1 && <p className="text-xs font-semibold text-gray-400 mb-2">{currency}</p>}
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {data.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {data.map((d) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
