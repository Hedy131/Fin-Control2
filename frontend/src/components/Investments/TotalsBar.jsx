import { formatCurrency } from '../../utils/currency.js'

export function groupInvestmentTotals(positions) {
  const byCurrency = {}
  for (const p of positions) {
    if (!byCurrency[p.currency]) byCurrency[p.currency] = { invested: 0, interest: 0 }
    byCurrency[p.currency].invested += p.invested_amount || 0
    byCurrency[p.currency].interest += p.interest_paid || 0
  }
  return byCurrency
}

export default function CurrencyTotalCard({ currency, totals }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 mb-2">{currency}</p>
      <p className="text-sm text-gray-500">Investido</p>
      <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.invested, currency)}</p>
      <p className="text-sm text-gray-500 mt-2">Juros Pagos</p>
      <p className={`text-lg font-bold ${totals.interest > 0 ? 'text-green-600' : 'text-gray-900'}`}>
        {formatCurrency(totals.interest, currency)}
      </p>
    </div>
  )
}
