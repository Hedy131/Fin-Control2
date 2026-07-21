import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { listBudgets } from '../api/budgets.js'
import { listCategories } from '../api/categories.js'
import { useAuth } from './AuthContext.jsx'
import { playAlertSound } from '../utils/sound.js'

const NotificationContext = createContext(null)
const POLL_INTERVAL_MS = 60000
const STORAGE_KEY = 'fincontrol_alerted_budgets'

function loadAlerted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAlerted(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)))
  } catch {
    // localStorage indisponível — não é crítico
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [toast, setToast] = useState(null)
  const alertedRef = useRef(new Set(loadAlerted()))

  const check = useCallback(async () => {
    try {
      const [budgets, categories] = await Promise.all([listBudgets(), listCategories()])
      const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Categoria'
      const exceeded = budgets.filter((b) => b.spent > b.amount)

      setAlerts(
        exceeded.map((b) => ({
          id: `${b.category_id}-${b.period_start}`,
          category_id: b.category_id,
          category_name: categoryName(b.category_id),
          excess: Math.round((b.spent - b.amount) * 100) / 100,
        }))
      )

      for (const b of exceeded) {
        const key = `${b.category_id}-${b.period_start}`
        if (!alertedRef.current.has(key)) {
          alertedRef.current.add(key)
          saveAlerted(alertedRef.current)
          setToast({
            id: key,
            category_id: b.category_id,
            category_name: categoryName(b.category_id),
            excess: Math.round((b.spent - b.amount) * 100) / 100,
          })
          playAlertSound()
        }
      }
    } catch {
      // alerta é um extra — uma falha aqui nunca deve derrubar a app
    }
  }, [])

  useEffect(() => {
    if (!user) return
    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [user, check])

  function dismissToast() {
    setToast(null)
  }

  return (
    <NotificationContext.Provider
      value={{ alerts, unreadCount: alerts.length, toast, dismissToast, recheckBudgets: check }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}
