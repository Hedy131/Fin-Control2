const TYPE_LABELS = {
  checking: 'Conta Corrente',
  savings: 'Poupanca',
  credit_card: 'Cartao de Credito',
  cash: 'Dinheiro',
  investment: 'Investimento',
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export default function AccountList({ accounts, onDelete }) {
  if (accounts.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma conta cadastrada.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((acc) => (
        <div key={acc.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{acc.name}</p>
              <p className="text-xs text-gray-400">{TYPE_LABELS[acc.type] || acc.type}</p>
            </div>
            <button onClick={() => onDelete(acc.id)} className="text-xs text-red-500 hover:text-red-700">
              Remover
            </button>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-4">{formatCurrency(acc.current_balance)}</p>
        </div>
      ))}
    </div>
  )
}
