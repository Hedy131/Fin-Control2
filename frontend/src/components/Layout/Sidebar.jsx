import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Painel', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/investimentos', label: 'Investimentos' },
  { to: '/metas', label: 'Metas' },
]

const settingsLinks = [
  { to: '/configuracoes/senha', label: 'Senha' },
  { to: '/accounts', label: 'Contas' },
  { to: '/categories', label: 'Categorias' },
]

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm font-medium transition ${
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
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              <span>Configurações</span>
              <span className={`transition-transform ${settingsOpen ? 'rotate-90' : ''}`}>›</span>
            </button>
            {settingsOpen && (
              <div className="pl-3 space-y-1 border-l border-gray-100 ml-3">
                {settingsLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} className={linkClass}>
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
