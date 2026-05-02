import type { Guid, IsoDateTime } from './common'
import type {
  FigureType,
  GameResult,
  GameTerminationReason,
  PlayerColor,
  SkinRarity,
  UserRole,
} from './enums'

export interface UserDto {
  id: Guid
  login: string
  email: string
  rating: number
  balance: number
  lootBoxCount: number
  role: UserRole
  isDeleted: boolean
}

// у бэка пока named tuple — приходит как {Item1..Item4}, см. api-needs.md #6
export interface FigurePosition {
  a: number
  b: number
  figure: FigureType
  color: PlayerColor
}

export interface GameDto {
  id: Guid
  whitePlayerId: Guid
  blackPlayerId: Guid
  result: GameResult | null
  terminationReason: GameTerminationReason | null
  startTimeUtc: IsoDateTime | null
  endTimeUtc: IsoDateTime | null
  initialTimeSec: number | null
  incrementPerMoveSec: number | null
  figures: FigurePosition[]
}

export interface MoveResultDto {
  isApply: boolean
  isValid: boolean | null
  isGameOver: boolean
  terminationReason: GameTerminationReason | null
}

export interface LootBoxDropResultDto {
  skinId: Guid
  isDuplicate: boolean
}

// shape пока придумали мы, друг ещё не определил
export interface PlanetDto {
  id: Guid
  name: string
  imageUrl: string
}

export interface SkinDto {
  id: Guid
  planetId: Guid
  figureType: FigureType
  rarity: SkinRarity
  name: string | null
  imageUrl: string | null
  description: string | null
}

export interface OwnedSkinDto extends SkinDto {
  isActive: boolean
}

// формат options — TODO, см. api-needs.md #7
export interface Move {
  a: number
  b: number
  x: number
  y: number
  options: unknown[]
}
