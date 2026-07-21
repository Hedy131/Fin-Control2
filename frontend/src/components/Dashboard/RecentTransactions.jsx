import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listTransactions } from '../../api/transactions.js'
import { listAccounts } from '../../api/accounts.js'
import { listCategories } from '../../api/categories.js'
import CategoryAvatar from '../Common/CategoryAvatar.jsx'
import Card from '../Common/Card.jsx'
import { formatCurrency } from '../../utils/currency.js'
import { TYPE_COLOR } from '../../utils/categoryTypes.js'

export default function RecentTransactions({ periodStart, periodEnd }) {
  const [transactions, setTransactions] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setTransactions(null)
    const params = { limit: 5 }
    if (periodStart) params.start_date = periodStart
    if (periodEnd) params.end_date = periodEnd
    Promise.all([listTransactions(params), listAccounts(), listCategories()]).then(([t, a, c]) => {
      setTransactions(t)
      setAccounts(a)
      setCategories(c)
    })
  }, [periodStart, periodEnd])

  const account = (id) => accounts.find((a) => a.id === id)
  const categoryFor = (id) => categories.find((c) => c.id === id)

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-base font-semibold text-gray-700">Transações Recentes</p>
        <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700">
          Ver todas
        </Link>
      </div>
      {transactions === null ? (
        <p className="text-sm text-gray-400">A carregar...</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-gray-400">Sem transações ainda.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((t) => {
            const src = account(t.account_id)
            return (
              <div key={t.id} className="flex items-center gap-3">
                <CategoryAvatar category={categoryFor(t.category_id)} description={t.description} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-900 truncate">
                    {t.description || categoryFor(t.category_id)?.name || '-'}
                  </p>
                  <p className="text-sm text-gray-400">{t.date}</p>
                </div>
                <p className={`text-base font-medium whitespace-nowrap ${TYPE_COLOR[t.type]}`}>
                  {['expense', 'investment', 'savings'].includes(t.type) ? '-' : ''}
                  {formatCurrency(t.amount, src?.currency)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
