function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

const TYPE_COLOR = {
  income: 'text-green-600',
  expense: 'text-red-600',
  transfer: 'text-gray-600',
}

export default function TransactionList({ transactions, accounts, categories, onDelete }) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma transacao encontrada.</p>
  }

  const accountName = (id) => accounts.find((a) => a.id === id)?.name || '-'
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '-'

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="text-left px-4 py-3">Data</th>
            <th className="text-left px-4 py-3">Descricao</th>
            <th className="text-left px-4 py-3">Conta</th>
            <th className="text-left px-4 py-3">Categoria</th>
            <th className="text-right px-4 py-3">Valor</th>
            <th className="text-right px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className="px-4 py-3 text-gray-600">{t.date}</td>
              <td className="px-4 py-3 text-gray-900">{t.description || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{accountName(t.account_id)}</td>
              <td className="px-4 py-3 text-gray-600">{categoryName(t.category_id)}</td>
              <td className={`px-4 py-3 text-right font-medium ${TYPE_COLOR[t.type]}`}>
                {t.type === 'expense' ? '-' : ''}{formatCurrency(t.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => onDelete(t.id)} className="text-xs text-red-500 hover:text-red-700">
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
