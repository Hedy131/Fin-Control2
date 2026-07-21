import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AllocationChart({ positions, categories }) {
  const categoryFor = (id) => categories.find((c) => c.id === id)

  const data = positions
    .filter((p) => (p.invested_amount || 0) > 0)
    .map((p) => {
      const category = categoryFor(p.category_id)
      return { name: category?.name || '-', total: p.invested_amount, color: category?.color || '#6366f1' }
    })

  if (data.length === 0) {
    return <p className="text-sm text-gray-400">Sem valor investido ainda.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => `${entry.name} (${Math.round((entry.percent || 0) * 100)}%)`}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
