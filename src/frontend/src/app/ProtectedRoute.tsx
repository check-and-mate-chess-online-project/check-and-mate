import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/auth/useAuth'
import { useSyncEquippedSkins } from '../shared/lib/useSyncEquippedSkins'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  useSyncEquippedSkins()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
