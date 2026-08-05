import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowLeftRight, CreditCard, Wallet, TrendingUp, Target } from 'lucide-react'
import { search as runSearch } from '../../api/search.js'
import { formatCurrency } from '../../utils/currency.js'

const EMPTY_RESULTS = { transactions: [], accounts: [], budgets: [], investments: [], goals: [] }

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(EMPTY_RESULTS)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults(EMPTY_RESULTS)
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      runSearch(q)
        .then((r) => setResults(r))
        .catch(() => setResults(EMPTY_RESULTS))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function clear() {
    setQuery('')
    setResults(EMPTY_RESULTS)
  }

  function go(path) {
    setOpen(false)
    navigate(path)
  }

  const total =
    results.transactions.length + results.accounts.length + results.budgets.length + results.investments.length + results.goals.length

  const groups = [
    {
      key: 'transactions',
      label: 'Transações',
      Icon: ArrowLeftRight,
      items: results.transactions,
      render: (t) => (
        <button
          key={`tx-${t.id}`}
          onClick={() => go(`/transactions?search=${encodeURIComponent(query.trim())}`)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between gap-2"
        >
          <span className="text-sm text-gray-800 truncate">{t.description || 'Sem descrição'}</span>
          <span className="text-xs text-gray-400 shrink-0">{formatCurrency(t.amount, t.currency)}</span>
        </button>
      ),
    },
    {
      key: 'accounts',
      label: 'Contas',
      Icon: CreditCard,
      items: results.accounts,
      render: (a) => (
        <button
          key={`acc-${a.id}`}
          onClick={() => go(`/accounts?highlight=${a.id}`)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-800 truncate"
        >
          {a.name}
        </button>
      ),
    },
    {
      key: 'budgets',
      label: 'Orçamentos',
      Icon: Wallet,
      items: results.budgets,
      render: (c) => (
        <button
          key={`budget-${c.category_id}`}
          onClick={() => go(`/budgets?highlight=${c.category_id}`)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          <span className="text-sm text-gray-800 truncate">{c.name}</span>
        </button>
      ),
    },
    {
      key: 'investments',
      label: 'Investimentos',
      Icon: TrendingUp,
      items: results.investments,
      render: (c) => (
        <button
          key={`inv-${c.category_id}`}
          onClick={() => go(`/investimentos?highlight=${c.category_id}`)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          <span className="text-sm text-gray-800 truncate">{c.name}</span>
        </button>
      ),
    },
    {
      key: 'goals',
      label: 'Metas',
      Icon: Target,
      items: results.goals,
      render: (c) => (
        <button
          key={`goal-${c.category_id}`}
          onClick={() => go(`/metas?highlight=${c.category_id}`)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
          <span className="text-sm text-gray-800 truncate">{c.name}</span>
        </button>
      ),
    },
  ]

  return (
    <div className="relative w-full sm:max-w-sm" ref={containerRef}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Pesquisar transações, orçamentos, contas..."
          className="w-full rounded-lg border border-gray-300 pl-9 pr-8 py-2 text-sm bg-white"
        />
        {query && (
          <button
            onClick={clear}
            aria-label="Limpar pesquisa"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg z-50 max-h-96 overflow-y-auto p-2">
          {loading && <p className="text-sm text-gray-400 text-center py-4">A pesquisar...</p>}
          {!loading && total === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum resultado encontrado.</p>}
          {!loading &&
            groups
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <div key={g.key} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                    <g.Icon size={12} />
                    {g.label}
                  </div>
                  {g.items.map(g.render)}
                </div>
              ))}
        </div>
      )}
    </div>
  )
}
