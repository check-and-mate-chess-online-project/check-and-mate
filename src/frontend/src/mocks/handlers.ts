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

const PLANETS = [
  {
    id: 'earth',
    name: 'Earth',
    imageUrl: '/planets/earth_big.webp',
  },
  {
    id: 'mars',
    name: 'Mars',
    imageUrl: '/planets/mars_big.webp',
  },
]

interface MockSkin {
  id: string
  planetId: string
  figureType: FigureType
  rarity: SkinRarity
  name: string | null
  imageUrl: string | null
  description: string | null
}

const PLANET_SKINS: MockSkin[] = [
  {
    id: 'gagarin-king',
    planetId: 'earth',
    figureType: FigureType.King,
    rarity: SkinRarity.Legendary,
    name: 'Gagarin',
    imageUrl: '/skins/gagarin-king-idle.webp',
    description: 'Первый человек в космосе. Ведёт землян за собой к звёздам.',
  },
  {
    id: 'earth-queen-locked',
    planetId: 'earth',
    figureType: FigureType.Queen,
    rarity: SkinRarity.Rare,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'earth-rook-locked',
    planetId: 'earth',
    figureType: FigureType.Rook,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'earth-bishop-locked',
    planetId: 'earth',
    figureType: FigureType.Bishop,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'earth-knight-locked',
    planetId: 'earth',
    figureType: FigureType.Knight,
    rarity: SkinRarity.Rare,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'earth-pawn-locked',
    planetId: 'earth',
    figureType: FigureType.Pawn,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-king-locked',
    planetId: 'mars',
    figureType: FigureType.King,
    rarity: SkinRarity.Legendary,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-queen-locked',
    planetId: 'mars',
    figureType: FigureType.Queen,
    rarity: SkinRarity.Rare,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-rook-locked',
    planetId: 'mars',
    figureType: FigureType.Rook,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-bishop-locked',
    planetId: 'mars',
    figureType: FigureType.Bishop,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-knight-locked',
    planetId: 'mars',
    figureType: FigureType.Knight,
    rarity: SkinRarity.Rare,
    name: null,
    imageUrl: null,
    description: null,
  },
  {
    id: 'mars-pawn-locked',
    planetId: 'mars',
    figureType: FigureType.Pawn,
    rarity: SkinRarity.Common,
    name: null,
    imageUrl: null,
    description: null,
  },
]

const OWNED_SKIN_IDS = new Set<string>(['gagarin-king'])
const ACTIVE_BY_FIGURE: Record<number, string | null> = {
  [FigureType.King]: 'gagarin-king',
}

function requireAuth(request: Request): HttpResponse<null> | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer '))
    return new HttpResponse(null, { status: 401 })
  return null
}

export const handlers = [
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

  http.get('/api/planets', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(PLANETS)
  }),

  http.get('/api/planets/:planetId/skins', ({ request, params }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const list = PLANET_SKINS.filter((s) => s.planetId === params.planetId)
    return HttpResponse.json(list)
  }),

  http.get('/api/users/me/inventory', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const owned = PLANET_SKINS.filter((s) => OWNED_SKIN_IDS.has(s.id)).map(
      (s) => ({
        ...s,
        isActive: ACTIVE_BY_FIGURE[s.figureType] === s.id,
      }),
    )
    return HttpResponse.json(owned)
  }),

  http.post('/api/users/me/customizations', async ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const body = (await request.json()) as {
      figureType: number
      skinId: string
    }
    if (!OWNED_SKIN_IDS.has(body.skinId)) {
      return new HttpResponse(null, { status: 400 })
    }
    ACTIVE_BY_FIGURE[body.figureType] = body.skinId
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/lootboxes/open', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const random = PLANET_SKINS[Math.floor(Math.random() * PLANET_SKINS.length)]
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
