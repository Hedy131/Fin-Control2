import { formatCurrency } from '../../utils/currency.js'

const TYPE_LABELS = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit_card: 'Cartão de Crédito',
  cash: 'Dinheiro',
  investment: 'Investimento',
}

export default function AccountList({ accounts, onEdit, onDelete }) {
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
            <div className="flex gap-2">
              <button onClick={() => onEdit(acc)} className="text-xs text-primary-600 hover:text-primary-700">
                Editar
              </button>
              <button onClick={() => onDelete(acc.id)} className="text-xs text-red-500 hover:text-red-700">
                Remover
              </button>
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-4">{formatCurrency(acc.current_balance, acc.currency)}</p>
        </div>
      ))}
    </div>
  )
}
