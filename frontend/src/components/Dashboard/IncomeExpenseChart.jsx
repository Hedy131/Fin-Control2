import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPeriodShort } from '../../utils/period.js'

function valueFor(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

export default function IncomeExpenseChart({ data }) {
  const periods = data || []
  const currencies = [
    ...new Set(
      periods.flatMap((p) => [...p.income_by_currency, ...p.expense_by_currency].map((x) => x.currency))
    ),
  ]

  if (currencies.length === 0) {
    return <p className="text-sm text-gray-400">Sem dados suficientes ainda.</p>
  }

  return (
    <div className="space-y-6">
      {currencies.map((currency) => {
        const chartData = periods.map((p) => ({
          name: formatPeriodShort({ start: p.period_start, end: p.period_end }),
          Receitas: valueFor(p.income_by_currency, currency),
          Despesas: valueFor(p.expense_by_currency, currency),
        }))
        return (
          <div key={currency}>
            {currencies.length > 1 && <p className="text-xs font-semibold text-gray-400 mb-2">{currency}</p>}
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Receitas" fill="#22c55e" />
                <Bar dataKey="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
