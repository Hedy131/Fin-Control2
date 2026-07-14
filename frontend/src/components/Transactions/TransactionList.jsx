import { Fragment } from 'react'
import { formatCurrency } from '../../utils/currency.js'
import { TYPE_COLOR } from '../../utils/categoryTypes.js'
import TransactionForm from './TransactionForm.jsx'

export default function TransactionList({
  transactions,
  accounts,
  categories,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDuplicate,
  onDelete,
  editingId,
  editInitialValues,
  onEditSubmit,
  onEditCancel,
}) {
  if (transactions.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma transação encontrada.</p>
  }

  const account = (id) => accounts.find((a) => a.id === id)
  const accountName = (id) => account(id)?.name || '-'
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || '-'
  const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id))

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th className="text-left px-4 py-3 w-8">
              <input type="checkbox" checked={allSelected} onChange={(e) => onToggleSelectAll(e.target.checked)} />
            </th>
            <th className="text-left px-4 py-3">Data</th>
            <th className="text-left px-4 py-3">Descrição</th>
            <th className="text-left px-4 py-3">Conta</th>
            <th className="text-left px-4 py-3">Categoria</th>
            <th className="text-right px-4 py-3">Valor</th>
            <th className="text-right px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((t) => {
            const src = account(t.account_id)
            return (
              <Fragment key={t.id}>
                <tr className={selectedIds.has(t.id) ? 'bg-primary-50/40' : ''}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => onToggleSelect(t.id)} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {t.date}
                    {t.time && <span className="text-gray-400"> {t.time.slice(0, 5)}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {t.description || '-'}
                    {t.type === 'transfer' && (
                      <span className="block text-xs text-gray-400">
                        → {accountName(t.destination_account_id)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{accountName(t.account_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{categoryName(t.category_id)}</td>
                  <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${TYPE_COLOR[t.type]}`}>
                    {['expense', 'investment', 'savings'].includes(t.type) ? '-' : ''}
                    {formatCurrency(t.amount, src?.currency)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => onDuplicate(t)} className="text-xs text-gray-500 hover:text-gray-700 mr-3">
                      Duplicar
                    </button>
                    <button onClick={() => (editingId === t.id ? onEditCancel() : onEdit(t))} className="text-xs text-primary-600 hover:text-primary-700 mr-3">
                      {editingId === t.id ? 'Fechar' : 'Editar'}
                    </button>
                    <button onClick={() => onDelete(t.id)} className="text-xs text-red-500 hover:text-red-700">
                      Remover
                    </button>
                  </td>
                </tr>
                {editingId === t.id && (
                  <tr>
                    <td colSpan={7} className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                      <TransactionForm
                        accounts={accounts}
                        categories={categories}
                        initialValues={editInitialValues}
                        onSubmit={onEditSubmit}
                        onCancel={onEditCancel}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
