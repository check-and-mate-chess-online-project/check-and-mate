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
  http.post('/api/auth/register', () => {
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
