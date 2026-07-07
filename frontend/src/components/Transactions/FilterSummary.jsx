import { formatCurrency } from '../../utils/currency.js'

export default function FilterSummary({ byCurrency }) {
  if (!byCurrency || byCurrency.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {byCurrency.map((row) => (
        <div key={row.currency} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-medium text-gray-400 mb-2">{row.currency}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Receitas</span>
              <span className="text-green-600 font-medium">{formatCurrency(row.income, row.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Despesas</span>
              <span className="text-red-600 font-medium">{formatCurrency(row.expense, row.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Investimentos</span>
              <span className="text-blue-600 font-medium">{formatCurrency(row.investment, row.currency)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Saldo</span>
              <span className={`font-bold ${row.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(row.balance, row.currency)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
