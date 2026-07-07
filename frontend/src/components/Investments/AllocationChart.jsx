import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { INVESTMENT_TYPE_LABEL, INVESTMENT_TYPE_COLOR } from '../../utils/investmentTypes.js'

export default function AllocationChart({ positions }) {
  const byType = {}
  for (const p of positions) {
    byType[p.type] = (byType[p.type] || 0) + (p.current_value || 0)
  }
  const data = Object.entries(byType)
    .filter(([, total]) => total > 0)
    .map(([type, total]) => ({ type, label: INVESTMENT_TYPE_LABEL[type] || type, total }))

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sem valor investido ainda.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={(entry) => entry.label}>
          {data.map((entry) => (
            <Cell key={entry.type} fill={INVESTMENT_TYPE_COLOR[entry.type] || '#6366f1'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
