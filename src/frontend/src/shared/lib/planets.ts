import { FigureType } from '../api/enums'

export interface FrontendPlanet {
  id: string
  imageUrl: string
  figures: FigureType[]
  available: boolean
}

export const PLANETS: FrontendPlanet[] = [
  {
    id: 'earth',
    imageUrl: '/planets/earth_big.webp',
    figures: [
      FigureType.King,
      FigureType.Queen,
      FigureType.Rook,
      FigureType.Bishop,
      FigureType.Knight,
      FigureType.Pawn,
    ],
    available: true,
  },
  {
    id: 'mars',
    imageUrl: '/planets/mars_big.webp',
    figures: [],
    available: false,
  },
]

export function planetById(id: string): FrontendPlanet | undefined {
  return PLANETS.find((p) => p.id === id)
}

export function planetForSkin(): FrontendPlanet {
  return PLANETS[0]
}
