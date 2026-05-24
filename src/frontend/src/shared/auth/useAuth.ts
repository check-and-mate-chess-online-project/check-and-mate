import type { UserDto } from '../api'
import { useAuthStore } from './authStore'

export interface AuthState {
  isAuthenticated: boolean
  user: UserDto | null
}

export function useAuth(): AuthState {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  return { isAuthenticated, user }
}
