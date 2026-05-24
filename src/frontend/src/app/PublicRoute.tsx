import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/auth/useAuth'

export function PublicRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/lobby" replace />
  }

  return <Outlet />
}
