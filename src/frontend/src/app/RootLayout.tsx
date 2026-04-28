import { Link, NavLink, Outlet } from 'react-router-dom'
import logo from '../assets/logo.svg'
import { Dropdown } from '../shared/ui/Dropdown'

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
              <img src={logo} alt="Check &amp; Mate" className="h-12 w-auto" />
            </Link>
            <div className="flex gap-4 items-center">
              <NavLink to="/lobby" className={navLinkClass}>
                Lobby
              </NavLink>
              <Dropdown
                label="Skins"
                items={[
                  { label: 'Inventory', to: '/inventory' },
                  { label: 'Cases', to: '/cases' },
                  { label: 'Shop', to: '/shop' },
                ]}
              />
            </div>
          </div>
          <Dropdown
            label="Profile"
            align="right"
            items={[
              { label: 'My profile', to: '/profile' },
              { label: 'History', to: '/history' },
              { label: 'Friends', to: '/friends' },
              { label: 'Logout', onClick: handleLogout },
            ]}
          />
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
