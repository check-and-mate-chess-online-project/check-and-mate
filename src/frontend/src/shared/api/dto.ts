import type { Guid, IsoDateTime } from './common'
import type {
  FigureType,
  FriendRequestState,
  GameInvitationState,
  GameResult,
  GameTerminationReason,
  MoveAttemptStatus,
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

export interface AuthResultDto {
  user: UserDto
  token: string
}

export interface FigureDto {
  a: number
  b: number
  type: FigureType
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
  timeControlIsEnabled: boolean
  initialTimeSec: number | null
  incrementPerMoveSec: number | null
  figures: FigureDto[]
  moves: PlyDto[]
}

export interface MoveDto {
  a: number
  b: number
  x: number
  y: number
  options: MoveOptionsDto
}

export interface PlyDto {
  moveNumber: number
  color: PlayerColor
  coordinates: MoveDto[]
}

export interface MoveOptionsDto {
  selectedFigure: FigureType | null
}

export interface MakeMoveRequest {
  a: number
  b: number
  x: number
  y: number
  options: MoveOptionsDto
}

export interface MoveResultDto {
  status: MoveAttemptStatus
  game: GameDto
  isGameOver: boolean
  terminationReason: GameTerminationReason | null
}

export interface LootBoxDropResultDto {
  skin: SkinDto
  isDuplicate: boolean
}

export interface PlanetDto {
  id: Guid
  name: string
  imageUrl: string
}

export interface SkinDto {
  id: Guid
  setId: Guid
  figure: FigureType
  rarity: SkinRarity
  whiteImage: string
  blackImage: string
  isDefault: boolean
}

export interface GameInvitationDto {
  id: Guid
  receiverId: Guid
  senderId: Guid
  timeControlIsEnabled: boolean
  initialTimeSec: number | null
  incrementPerMoveSec: number | null
  expiresAt: IsoDateTime
  state: GameInvitationState
}

export interface FriendRequestDto {
  id: Guid
  receiverId: Guid
  senderId: Guid
  state: FriendRequestState
}
