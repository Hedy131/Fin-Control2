import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ExpenseChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400">Sem despesas categorizadas neste período.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category_name" cx="50%" cy="50%" outerRadius={70}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color || '#6366f1'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
