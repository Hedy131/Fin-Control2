import { useAuth } from '../../context/AuthContext.jsx'
import NotificationBell from '../Notifications/NotificationBell.jsx'

export default function Navbar({ onToggleSidebar }) {
  const { logout } = useAuth()

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
      <button
        onClick={onToggleSidebar}
        aria-label="Alternar menu"
        className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 hover:text-red-700 ml-2"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
