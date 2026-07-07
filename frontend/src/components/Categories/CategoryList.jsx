export default function CategoryList({ categories, onDelete }) {
  if (categories.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria cadastrada.</p>
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
            <span className="text-xs text-gray-400">{cat.type === 'income' ? 'Receita' : 'Despesa'}</span>
          </div>
          <button onClick={() => onDelete(cat.id)} className="text-xs text-red-500 hover:text-red-700">
            Remover
          </button>
        </div>
      ))}
    </div>
  )
}
