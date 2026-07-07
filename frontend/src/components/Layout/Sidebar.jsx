import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Painel', end: true },
  { to: '/transactions', label: 'Transações' },
  { to: '/accounts', label: 'Contas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/investimentos', label: 'Investimentos' },
  { to: '/metas', label: 'Metas' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-primary-600">FinControl</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
