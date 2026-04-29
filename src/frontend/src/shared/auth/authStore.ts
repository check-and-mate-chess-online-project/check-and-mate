import { create } from 'zustand'
import type { UserDto } from '../api'
import { clearToken, getToken, setToken } from './token'

interface AuthState {
  user: UserDto | null
  token: string | null
  isAuthenticated: boolean
  setSession: (token: string, user: UserDto) => void
  setUser: (user: UserDto) => void
  clearSession: () => void
}

const initialToken = getToken()

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isAuthenticated: initialToken !== null,
  setSession: (token, user) => {
    setToken(token)
    set({ token, user, isAuthenticated: true })
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    clearToken()
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
