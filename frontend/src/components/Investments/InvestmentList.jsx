import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/currency.js'

function PositionCard({ position, category }) {
  const navigate = useNavigate()
  const interest = position.interest_paid || 0

  return (
    <div
      onClick={() => navigate(`/transactions?category_id=${position.category_id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer transition-colors hover:bg-gray-50 hover:border-primary-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category?.color || '#6366f1' }} />
        <p className="font-semibold text-gray-900">{category?.name || '-'}</p>
      </div>
      <p className="text-sm text-gray-600">
        Investido:{' '}
        <span className="font-medium text-gray-900">
          {formatCurrency(position.invested_amount, position.currency)}
        </span>
      </p>
      <p className={`text-sm font-semibold mt-1 ${interest > 0 ? 'text-green-600' : 'text-gray-400'}`}>
        Juros Pagos: {formatCurrency(interest, position.currency)}
      </p>
    </div>
  )
}

export default function InvestmentList({ positions, categories }) {
  if (positions.length === 0) {
    return <p className="text-sm text-gray-400">Nenhuma categoria de investimento cadastrada ainda.</p>
  }

  const categoryFor = (id) => categories.find((c) => c.id === id)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {positions.map((p) => (
        <PositionCard key={p.id} position={p} category={categoryFor(p.category_id)} />
      ))}
    </div>
  )
}
