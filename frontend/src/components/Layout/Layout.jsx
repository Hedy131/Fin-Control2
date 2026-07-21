import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'
import AlertBanner from '../Notifications/AlertBanner.jsx'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem('sidebar_open')
    return stored === null ? true : stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar_open', String(sidebarOpen))
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen">
      <AlertBanner />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
