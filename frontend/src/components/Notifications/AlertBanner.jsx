import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext.jsx'

export default function AlertBanner() {
  const { toast, dismissToast } = useNotifications() || {}

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(dismissToast, 6000)
    return () => clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null

  const isDuplicate = toast.kind === 'duplicate'
  const bg = isDuplicate ? 'bg-amber-600' : 'bg-red-600'
  const subtitleColor = isDuplicate ? 'text-amber-100' : 'text-red-100'
  const closeColor = isDuplicate ? 'text-amber-100 hover:text-white' : 'text-red-100 hover:text-white'

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className={`flex items-start gap-3 ${bg} text-white rounded-xl shadow-lg px-4 py-3`}>
        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <p className="font-semibold">{toast.title}</p>
          <p className={subtitleColor}>{toast.subtitle}</p>
        </div>
        <button onClick={dismissToast} aria-label="Fechar" className={`shrink-0 ${closeColor}`}>
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
