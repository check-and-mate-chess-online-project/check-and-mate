import { http, HttpResponse } from 'msw'
import type { UserDto } from '../shared/api'
import { FigureType, SkinRarity, UserRole } from '../shared/api'

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

const MOCK_SKINS = [
  {
    id: 'skin-king-1',
    figureType: FigureType.King,
    rarity: SkinRarity.Legendary,
    name: 'Nebula King',
    isActive: true,
  },
  {
    id: 'skin-queen-1',
    figureType: FigureType.Queen,
    rarity: SkinRarity.Rare,
    name: 'Stardust Queen',
    isActive: true,
  },
  {
    id: 'skin-rook-1',
    figureType: FigureType.Rook,
    rarity: SkinRarity.Common,
    name: 'Asteroid Rook',
    isActive: true,
  },
  {
    id: 'skin-bishop-1',
    figureType: FigureType.Bishop,
    rarity: SkinRarity.Common,
    name: 'Comet Bishop',
    isActive: true,
  },
  {
    id: 'skin-knight-1',
    figureType: FigureType.Knight,
    rarity: SkinRarity.Rare,
    name: 'Voidrunner',
    isActive: true,
  },
  {
    id: 'skin-pawn-1',
    figureType: FigureType.Pawn,
    rarity: SkinRarity.Common,
    name: 'Cosmic Recruit',
    isActive: true,
  },
]

function requireAuth(request: Request): HttpResponse<null> | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer '))
    return new HttpResponse(null, { status: 401 })
  return null
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
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(mockUser)
  }),

  http.get('/api/users/:userId', ({ request, params }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json({
      ...mockUser,
      id: params.userId,
      login: `player-${String(params.userId).slice(0, 6)}`,
    })
  }),

  http.get('/api/users/me/inventory', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(MOCK_SKINS)
  }),

  http.post('/api/users/me/customizations', async ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/lootboxes/open', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const random = MOCK_SKINS[Math.floor(Math.random() * MOCK_SKINS.length)]
    return HttpResponse.json({
      skinId: random.id,
      isDuplicate: Math.random() > 0.4,
    })
  }),

  http.post('/api/lootboxes/buy', async ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const body = (await request.json()) as { count?: number }
    const count = body.count ?? 1
    return HttpResponse.json({
      balance: mockUser.balance - count * 100,
      lootBoxCount: mockUser.lootBoxCount + count,
    })
  }),

  http.get('/api/users/me/games', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json([])
  }),

  http.get('/api/games/:gameId', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/api/users/me/friends', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json({
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      gameInvitations: [],
    })
  }),
]
