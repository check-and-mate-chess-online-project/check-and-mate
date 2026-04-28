import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-slate-100' : 'text-slate-400 hover:text-slate-100'

export function RootLayout() {
  const handleLogout = () => {
    alert('logout — будет реализован вместе с auth')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/lobby" className="block">
              <img src={logo} alt="Check &amp; Mate" className="h-10 w-auto" />
            </Link>
            <div className="flex gap-4">
              <NavLink to="/lobby" className={navLinkClass}>
                Lobby
              </NavLink>
              <NavLink to="/inventory" className={navLinkClass}>
                Inventory
              </NavLink>
              <NavLink to="/cases" className={navLinkClass}>
                Cases
              </NavLink>
              <NavLink to="/friends" className={navLinkClass}>
                Friends
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                History
              </NavLink>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-100"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
