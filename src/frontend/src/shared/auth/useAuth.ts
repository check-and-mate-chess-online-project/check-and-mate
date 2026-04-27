// Временная заглушка. Будет заменена на Zustand store + JWT,
// сигнатура останется та же.
export interface AuthState {
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  return { isAuthenticated: false }
}
