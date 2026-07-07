import { useAuth } from '../../context/AuthContext.jsx'

export default function Navbar() {
  const { logout } = useAuth()

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
