function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export default function SummaryCards({ summary }) {
  const cards = [
    { label: 'Saldo Total', value: summary.total_balance, color: 'text-gray-900' },
    { label: 'Receitas do Mes', value: summary.month_income, color: 'text-green-600' },
    { label: 'Despesas do Mes', value: summary.month_expense, color: 'text-red-600' },
    { label: 'Saldo do Mes', value: summary.month_balance, color: summary.month_balance >= 0 ? 'text-green-600' : 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-2 ${card.color}`}>{formatCurrency(card.value)}</p>
        </div>
      ))}
    </div>
  )
}
