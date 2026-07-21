import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext.jsx'

export default function NotificationBell() {
  const { alerts, unreadCount } = useNotifications() || {}
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-semibold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notificações</p>
          </div>
          {(!alerts || alerts.length === 0) ? (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">Sem alertas ativos.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {alerts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setOpen(false)
                    navigate(a.kind === 'duplicate' ? '/transactions' : '/budgets')
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50"
                >
                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                  <p className={`text-xs ${a.kind === 'duplicate' ? 'text-amber-600' : 'text-red-600'}`}>
                    {a.subtitle}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
