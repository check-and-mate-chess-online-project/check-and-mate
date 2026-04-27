import { Link, NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-slate-100' : 'text-slate-400 hover:text-slate-100'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              Check &amp; Mate
            </Link>
            <div className="flex gap-4">
              <NavLink to="/" end className={navLinkClass}>
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
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
            <NavLink to="/register" className={navLinkClass}>
              Register
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
