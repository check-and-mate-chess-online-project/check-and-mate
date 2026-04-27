import { Outlet } from 'react-router-dom'

export function GuestLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <Outlet />
    </div>
  )
}
