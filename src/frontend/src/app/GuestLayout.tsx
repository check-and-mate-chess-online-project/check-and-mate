import { Outlet } from 'react-router-dom'
import { LanguageToggle } from '../shared/ui/LanguageToggle'

export function GuestLayout() {
  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  )
}
