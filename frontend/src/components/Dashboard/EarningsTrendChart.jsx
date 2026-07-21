import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPeriodShort } from '../../utils/period.js'
import Card from '../Common/Card.jsx'

function valueFor(arr, currency) {
  return arr.find((x) => x.currency === currency)?.total ?? 0
}

export default function EarningsTrendChart({ data }) {
  const periods = data || []
  const currencies = [...new Set(periods.flatMap((p) => (p.balance_by_currency || []).map((x) => x.currency)))]

  return (
    <Card>
      <p className="text-sm font-semibold text-gray-700 mb-4">Saldo por Período</p>
      {currencies.length === 0 ? (
        <p className="text-sm text-gray-400">Sem dados suficientes ainda.</p>
      ) : (
        <div className="space-y-6">
          {currencies.map((currency) => {
            const gradientId = `balanceGradient-${currency}`
            const chartData = periods.map((p) => ({
              name: formatPeriodShort({ start: p.period_start, end: p.period_end }),
              Saldo: valueFor(p.balance_by_currency, currency),
            }))
            return (
              <div key={currency}>
                {currencies.length > 1 && <p className="text-xs font-semibold text-gray-400 mb-2">{currency}</p>}
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Saldo" stroke="#4f46e5" strokeWidth={2} fill={`url(#${gradientId})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
