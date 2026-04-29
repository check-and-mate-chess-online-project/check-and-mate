import { http, HttpResponse } from 'msw'
import type { UserDto } from '../shared/api'
import { UserRole } from '../shared/api'

const mockUser: UserDto = {
  id: '00000000-0000-0000-0000-000000000001',
  login: 'mockuser',
  email: 'mock@example.com',
  rating: 1500,
  balance: 1000,
  lootBoxCount: 3,
  role: UserRole.Player,
  isDeleted: false,
}

export const handlers = [
  // потом убрать — должен идти к реальному /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { login?: string; password?: string }
    if (!body.login || !body.password) {
      return new HttpResponse(null, { status: 400 })
    }
    return HttpResponse.json({ token: 'mock-token' })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      login?: string
      email?: string
      password?: string
    }
    if (!body.login || !body.email || !body.password) {
      return new HttpResponse(null, { status: 400 })
    }
    return HttpResponse.json({ token: 'mock-token' })
  }),

  http.get('/api/users/me', ({ request }) => {
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return new HttpResponse(null, { status: 401 })
    }
    return HttpResponse.json(mockUser)
  }),
]
