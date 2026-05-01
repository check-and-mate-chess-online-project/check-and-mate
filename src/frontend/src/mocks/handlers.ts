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

interface MockSkin {
  id: string
  figureType: FigureType
  rarity: SkinRarity
  name: string
  isActive: boolean
}

let MOCK_SKINS: MockSkin[] = [
  { id: 'king-default', figureType: FigureType.King, rarity: SkinRarity.Common, name: 'Default King', isActive: false },
  { id: 'king-stellar', figureType: FigureType.King, rarity: SkinRarity.Rare, name: 'Stellar Monarch', isActive: false },
  { id: 'king-nebula', figureType: FigureType.King, rarity: SkinRarity.Legendary, name: 'Nebula King', isActive: true },

  { id: 'queen-default', figureType: FigureType.Queen, rarity: SkinRarity.Common, name: 'Default Queen', isActive: false },
  { id: 'queen-stardust', figureType: FigureType.Queen, rarity: SkinRarity.Rare, name: 'Stardust Queen', isActive: true },
  { id: 'queen-supernova', figureType: FigureType.Queen, rarity: SkinRarity.Legendary, name: 'Supernova', isActive: false },

  { id: 'rook-default', figureType: FigureType.Rook, rarity: SkinRarity.Common, name: 'Asteroid Rook', isActive: true },
  { id: 'rook-bunker', figureType: FigureType.Rook, rarity: SkinRarity.Rare, name: 'Orbital Bunker', isActive: false },

  { id: 'bishop-default', figureType: FigureType.Bishop, rarity: SkinRarity.Common, name: 'Comet Bishop', isActive: true },
  { id: 'bishop-prophet', figureType: FigureType.Bishop, rarity: SkinRarity.Rare, name: 'Void Prophet', isActive: false },

  { id: 'knight-default', figureType: FigureType.Knight, rarity: SkinRarity.Common, name: 'Default Knight', isActive: false },
  { id: 'knight-voidrunner', figureType: FigureType.Knight, rarity: SkinRarity.Rare, name: 'Voidrunner', isActive: true },
  { id: 'knight-eclipse', figureType: FigureType.Knight, rarity: SkinRarity.Legendary, name: 'Eclipse Rider', isActive: false },

  { id: 'pawn-default', figureType: FigureType.Pawn, rarity: SkinRarity.Common, name: 'Cosmic Recruit', isActive: true },
  { id: 'pawn-trooper', figureType: FigureType.Pawn, rarity: SkinRarity.Rare, name: 'Star Trooper', isActive: false },
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
    const body = (await request.json()) as { figureType: number; skinId: string }
    MOCK_SKINS = MOCK_SKINS.map((s) =>
      s.figureType === body.figureType
        ? { ...s, isActive: s.id === body.skinId }
        : s,
    )
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
