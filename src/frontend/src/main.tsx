import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { router } from './app/router'
import { queryClient } from './app/queryClient'
import { ErrorBoundary } from './app/ErrorBoundary'
import { ApiError, api } from './shared/api/http'
import type { UserDto } from './shared/api'
import { useAuthStore } from './shared/auth/authStore'
import { Starfield } from './shared/ui/Starfield'
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
    queryClient.setQueryData(['me'], user)
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
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Starfield />
          <RouterProvider router={router} />
          <Toaster theme="dark" richColors position="top-right" />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

bootstrap()
