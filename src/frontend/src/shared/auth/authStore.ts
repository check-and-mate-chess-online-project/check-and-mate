import { create } from 'zustand'
import type { UserDto } from '../api'
import { clearToken, getToken, setToken } from './token'
import { useEquippedSkinsStore } from '../lib/equippedSkins'

interface AuthState {
  user: UserDto | null
  token: string | null
  isAuthenticated: boolean
  pendingOnboarding: boolean
  setSession: (token: string, user: UserDto, onboarding?: boolean) => void
  setUser: (user: UserDto) => void
  setPendingOnboarding: (value: boolean) => void
  clearSession: () => void
}

const initialToken = getToken()
const ONBOARDING_KEY = 'check-and-mate:pending-onboarding'

function readPendingOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

function writePendingOnboarding(value: boolean): void {
  try {
    if (value) localStorage.setItem(ONBOARDING_KEY, '1')
    else localStorage.removeItem(ONBOARDING_KEY)
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isAuthenticated: initialToken !== null,
  pendingOnboarding: readPendingOnboarding(),
  setSession: (token, user, onboarding = false) => {
    setToken(token)
    writePendingOnboarding(onboarding)
    set({ token, user, isAuthenticated: true, pendingOnboarding: onboarding })
  },
  setUser: (user) => set({ user }),
  setPendingOnboarding: (value) => {
    writePendingOnboarding(value)
    set({ pendingOnboarding: value })
  },
  clearSession: () => {
    clearToken()
    writePendingOnboarding(false)
    useEquippedSkinsStore.getState().clear()
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      pendingOnboarding: false,
    })
  },
}))
