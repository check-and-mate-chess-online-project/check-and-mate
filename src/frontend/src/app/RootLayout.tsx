import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'
import { Dropdown } from '../shared/ui/Dropdown'
import { LanguageToggle } from '../shared/ui/LanguageToggle'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-slate-100' : 'text-slate-400 hover:text-slate-100'

export function RootLayout() {
  const { t } = useTranslation()

  const handleLogout = () => {
    alert(t('auth.logoutAlert'))
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
                {t('nav.lobby')}
              </NavLink>
              <Dropdown
                label={t('nav.skins')}
                items={[
                  { label: t('nav.skinsItems.inventory'), to: '/inventory' },
                  { label: t('nav.skinsItems.cases'), to: '/cases' },
                  { label: t('nav.skinsItems.shop'), to: '/shop' },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Dropdown
              label={t('nav.profile')}
              align="right"
              items={[
                { label: t('nav.profileItems.myProfile'), to: '/profile' },
                { label: t('nav.profileItems.history'), to: '/history' },
                { label: t('nav.profileItems.friends'), to: '/friends' },
                { label: t('nav.profileItems.logout'), onClick: handleLogout },
              ]}
            />
          </div>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
