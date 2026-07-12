import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/currency.js'

const SLICES = [
  { key: 'income', name: 'Receitas', color: '#16a34a' },
  { key: 'expense', name: 'Despesas', color: '#dc2626' },
  { key: 'investment', name: 'Investimentos', color: '#2563eb' },
  { key: 'savings', name: 'Poupanças', color: '#059669' },
]

function CompositionChart({ row }) {
  const data = SLICES.map((s) => ({ name: s.name, value: row[s.key] || 0, color: s.color })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return <p className="text-xs text-gray-400 flex items-center justify-center h-full py-8">Sem dados</p>
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={65}
          label={(entry) => `${Math.round((entry.percent || 0) * 100)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value, row.currency)} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function FilterSummary({ byCurrency }) {
  if (!byCurrency || byCurrency.length === 0) return null

  return (
    <div className="space-y-4">
      {byCurrency.map((row) => (
        <div key={row.currency} className="flex flex-col md:flex-row gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-1">
            <p className="text-xs font-medium text-gray-400 mb-2">{row.currency}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Receitas</span>
                <span className="text-green-600 font-medium">{formatCurrency(row.income, row.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Despesas</span>
                <span className="text-red-600 font-medium">{formatCurrency(row.expense, row.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Investimentos</span>
                <span className="text-blue-600 font-medium">{formatCurrency(row.investment, row.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Poupanças</span>
                <span className="text-emerald-600 font-medium">{formatCurrency(row.savings, row.currency)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-100">
                <span className="text-gray-700 font-medium">Saldo</span>
                <span className={`font-bold ${row.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(row.balance, row.currency)}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 w-full md:w-64 flex-shrink-0">
            <CompositionChart row={row} />
          </div>
        </div>
      ))}
    </div>
  )
}
