import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PackageSearch, ListChecks, LogOut, Package, Calculator } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { NetworkBanner } from './NetworkBanner'
import clsx from 'clsx'

export function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Caja', path: '/pos', icon: Calculator },
    { name: 'Inventario', path: '/inventory', icon: PackageSearch },
    { name: 'Reposición', path: '/restock', icon: ListChecks },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 sm:pb-0 sm:flex-row relative">
      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around sm:relative sm:w-64 sm:flex-col sm:justify-start sm:border-r sm:border-t-0 p-2 sm:p-4 z-40 sm:shadow-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="hidden sm:flex items-center justify-center gap-2 px-2 py-6 mb-4 text-blue-600">
          <Package strokeWidth={1.5} size={28} />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 absolute opacity-0 transition-opacity">StockSync</span>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">StockSync</span>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 p-2 sm:px-4 sm:py-3.5 rounded-xl transition-all text-[10px] sm:text-sm font-semibold select-none",
                isActive 
                  ? "text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100/50" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              <Icon size={22} className={clsx(isActive ? "text-blue-600" : "text-slate-400")} />
              <span>{item.name}</span>
            </Link>
          )
        })}

        <div className="hidden sm:block mt-auto border-t border-slate-100 pt-4">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-start gap-3 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <NetworkBanner />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
