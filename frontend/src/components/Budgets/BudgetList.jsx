function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export default function BudgetList({ budgets, categories, onDelete }) {
  if (budgets.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum orcamento cadastrado.</p>
  }

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '-'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((b) => {
        const pct = b.amount > 0 ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0
        const over = b.spent > b.amount
        return (
          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{categoryName(b.category_id)}</p>
                <p className="text-xs text-gray-400">{b.month}/{b.year}</p>
              </div>
              <button onClick={() => onDelete(b.id)} className="text-xs text-red-500 hover:text-red-700">
                Remover
              </button>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className={`h-2 rounded-full ${over ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {formatCurrency(b.spent)} de {formatCurrency(b.amount)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
