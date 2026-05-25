import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/auth/useAuth'
import { useAuthStore } from '../shared/auth/authStore'

export function PublicRoute() {
  const { isAuthenticated } = useAuth()
  const pendingOnboarding = useAuthStore((s) => s.pendingOnboarding)

  if (isAuthenticated) {
    return <Navigate to={pendingOnboarding ? '/onboarding' : '/lobby'} replace />
  }

  return <Outlet />
}
