import { http, HttpResponse } from 'msw'
import type { SkinDto } from '../shared/api'
import { FigureType, SkinRarity } from '../shared/api'

const PLANETS = [
  { id: 'earth', name: 'Earth', imageUrl: '/planets/earth_big.webp' },
  { id: 'mars', name: 'Mars', imageUrl: '/planets/mars_big.webp' },
]

const EMPTY_SKIN_ASSETS = {
  whiteBoardImage: '',
  blackBoardImage: '',
  idleImage: '',
  startFightWinImage: '',
  startFightLoseImage: '',
  endFightWinImage: '',
  endFightLoseImage: '',
}

const PLANET_SKINS: SkinDto[] = [
  {
    id: 'gagarin-king',
    setId: 'earth',
    name: 'Gagarin',
    description: null,
    figure: FigureType.King,
    rarity: SkinRarity.Legendary,
    ...EMPTY_SKIN_ASSETS,
    idleImage: '/skins/gagarin-king-idle.webp',
    isDefault: false,
  },
  {
    id: 'magnus-pawn',
    setId: 'earth',
    name: 'Magnus',
    description: null,
    figure: FigureType.Pawn,
    rarity: SkinRarity.Common,
    ...EMPTY_SKIN_ASSETS,
    idleImage: '/skins/magnus-pawn/idle.webp',
    isDefault: false,
  },
  ...(['queen', 'rook', 'bishop', 'knight'] as const).map((f, i) => ({
    id: `earth-${f}-locked`,
    setId: 'earth',
    name: `Earth ${f}`,
    description: null,
    figure: (i + 2) as FigureType,
    rarity: (i % 2 === 0 ? SkinRarity.Rare : SkinRarity.Common) as SkinRarity,
    ...EMPTY_SKIN_ASSETS,
    isDefault: false,
  })),
  ...(['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const).map(
    (f, i) => ({
      id: `mars-${f}-locked`,
      setId: 'mars',
      name: `Mars ${f}`,
      description: null,
      figure: (i + 1) as FigureType,
      rarity: (i % 3 === 0
        ? SkinRarity.Legendary
        : i % 2 === 0
          ? SkinRarity.Rare
          : SkinRarity.Common) as SkinRarity,
      ...EMPTY_SKIN_ASSETS,
      isDefault: false,
    }),
  ),
]

const OWNED_SKIN_IDS = new Set<string>(['gagarin-king', 'magnus-pawn'])

function requireAuth(request: Request): HttpResponse<null> | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer '))
    return new HttpResponse(null, { status: 401 })
  return null
}

export const handlers = [
  // нет на бэке: список планет
  http.get('/api/planets', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(PLANETS)
  }),

  // нет на бэке: скины коллекции
  http.get('/api/planets/:planetId/skins', ({ request, params }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(
      PLANET_SKINS.filter((s) => s.setId === params.planetId),
    )
  }),

  // бэк bugged: 500 на пустом inventory — пока мокаем
  http.get('/api/inventory/skins', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return HttpResponse.json(PLANET_SKINS.filter((s) => OWNED_SKIN_IDS.has(s.id)))
  }),

  // бэк проверяет Guid, моки используют строковые id — мокаем equip отдельно
  http.post('/api/inventory/skins/equip', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    return new HttpResponse(null, { status: 204 })
  }),

  // бэк bugged: 500 без кейсов — пока мокаем
  http.post('/api/inventory/lootboxes/open', ({ request }) => {
    const denied = requireAuth(request)
    if (denied) return denied
    const random = PLANET_SKINS[Math.floor(Math.random() * PLANET_SKINS.length)]
    return HttpResponse.json({
      skin: random,
      isDuplicate: Math.random() > 0.4,
    })
  }),

]
