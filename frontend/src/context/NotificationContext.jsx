import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { listBudgets } from '../api/budgets.js'
import { listCategories } from '../api/categories.js'
import { getDuplicateTransactions } from '../api/transactions.js'
import { useAuth } from './AuthContext.jsx'
import { playAlertSound } from '../utils/sound.js'
import { formatCurrency } from '../utils/currency.js'

const NotificationContext = createContext(null)
const POLL_INTERVAL_MS = 60000
const BUDGET_STORAGE_KEY = 'fincontrol_alerted_budgets'
const DUPLICATE_STORAGE_KEY = 'fincontrol_alerted_duplicates'

function loadSet(key) {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'))
  } catch {
    return new Set()
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)))
  } catch {
    // localStorage indisponível — não é crítico
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [budgetAlerts, setBudgetAlerts] = useState([])
  const [duplicateAlerts, setDuplicateAlerts] = useState([])
  const [toast, setToast] = useState(null)
  const alertedBudgetsRef = useRef(loadSet(BUDGET_STORAGE_KEY))
  const alertedDuplicatesRef = useRef(loadSet(DUPLICATE_STORAGE_KEY))

  const checkBudgets = useCallback(async () => {
    try {
      const [budgets, categories] = await Promise.all([listBudgets(), listCategories()])
      const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Categoria'
      const exceeded = budgets.filter((b) => b.spent > b.amount)

      setBudgetAlerts(
        exceeded.map((b) => ({
          id: `budget-${b.category_id}-${b.period_start}`,
          kind: 'budget',
          title: categoryName(b.category_id),
          subtitle: `${formatCurrency(b.spent - b.amount)} acima do limite`,
        }))
      )

      for (const b of exceeded) {
        const key = `${b.category_id}-${b.period_start}`
        if (!alertedBudgetsRef.current.has(key)) {
          alertedBudgetsRef.current.add(key)
          saveSet(BUDGET_STORAGE_KEY, alertedBudgetsRef.current)
          setToast({
            id: `budget-${key}`,
            kind: 'budget',
            title: `Orçamento excedido: ${categoryName(b.category_id)}`,
            subtitle: `${formatCurrency(b.spent - b.amount)} acima do limite definido.`,
          })
          playAlertSound()
        }
      }
    } catch {
      // alerta é um extra — uma falha aqui nunca deve derrubar a app
    }
  }, [])

  const checkDuplicates = useCallback(async () => {
    try {
      const { groups } = await getDuplicateTransactions()

      setDuplicateAlerts(
        groups.map((g) => ({
          id: `dup-${g.transaction_ids.join('-')}`,
          kind: 'duplicate',
          title: g.description || 'Transação sem descrição',
          subtitle: `${g.count}x ${formatCurrency(g.amount)} em ${g.date}`,
        }))
      )

      for (const g of groups) {
        const key = g.transaction_ids.join('-')
        if (!alertedDuplicatesRef.current.has(key)) {
          alertedDuplicatesRef.current.add(key)
          saveSet(DUPLICATE_STORAGE_KEY, alertedDuplicatesRef.current)
          setToast({
            id: `dup-${key}`,
            kind: 'duplicate',
            title: 'Possíveis transações duplicadas',
            subtitle: `${g.count}x "${g.description || 'sem descrição'}" — ${formatCurrency(g.amount)} em ${g.date}`,
          })
          playAlertSound()
        }
      }
    } catch {
      // alerta é um extra — uma falha aqui nunca deve derrubar a app
    }
  }, [])

  const checkAll = useCallback(() => {
    checkBudgets()
    checkDuplicates()
  }, [checkBudgets, checkDuplicates])

  useEffect(() => {
    if (!user) return
    checkAll()
    const interval = setInterval(checkAll, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, checkAll])

  function dismissToast() {
    setToast(null)
  }

  const alerts = [...budgetAlerts, ...duplicateAlerts]

  return (
    <NotificationContext.Provider
      value={{ alerts, unreadCount: alerts.length, toast, dismissToast, recheckBudgets: checkAll }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
