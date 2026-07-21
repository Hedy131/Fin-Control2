import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  TrendingUp,
  Target,
  Settings,
  Lock,
  CreditCard,
  Tag,
  ChevronRight,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Painel', end: true, Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações', Icon: ArrowLeftRight },
  { to: '/budgets', label: 'Orçamentos', Icon: Wallet },
  { to: '/investimentos', label: 'Investimentos', Icon: TrendingUp },
  { to: '/metas', label: 'Metas', Icon: Target },
]

const settingsLinks = [
  { to: '/configuracoes/senha', label: 'Senha', Icon: Lock },
  { to: '/accounts', label: 'Contas', Icon: CreditCard },
  { to: '/categories', label: 'Categorias', Icon: Tag },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(
    settingsLinks.some((link) => location.pathname.startsWith(link.to))
  )

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 bg-white border-r border-gray-200 overflow-hidden transition-all duration-200 shrink-0 ${
          open ? 'w-56 translate-x-0' : 'w-56 -translate-x-full md:w-0 md:translate-x-0 md:border-r-0'
        }`}
      >
        <div className="w-56 h-full flex flex-col">
          <div className="px-5 py-5 border-b border-gray-100">
            <h1 className="text-lg font-bold text-primary-600">FinControl</h1>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                <link.Icon size={17} />
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <span className="flex items-center gap-2.5">
                <Settings size={17} />
                Configurações
              </span>
              <ChevronRight size={16} className={`transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
            </button>
            {settingsOpen && (
              <div className="pl-3 space-y-1 border-l border-gray-100 ml-3">
                {settingsLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass}>
                    <link.Icon size={16} />
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  )
}
