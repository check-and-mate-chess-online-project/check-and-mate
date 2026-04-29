import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { ApiError, api } from './shared/api/http'
import type { UserDto } from './shared/api'
import { useAuthStore } from './shared/auth/authStore'
import './i18n'
import './index.css'

async function startMocks() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

async function bootstrapAuth() {
  const { token, setUser, clearSession } = useAuthStore.getState()
  if (!token) return
  try {
    const user = await api.get<UserDto>('/api/users/me')
    setUser(user)
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      clearSession()
    }
  }
}

async function bootstrap() {
  await startMocks()
  await bootstrapAuth()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

bootstrap()
