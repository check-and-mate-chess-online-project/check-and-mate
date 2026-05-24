export const FigureType = {
  King: 1,
  Queen: 2,
  Rook: 3,
  Bishop: 4,
  Knight: 5,
  Pawn: 6,
} as const
export type FigureTypeValue = (typeof FigureType)[keyof typeof FigureType]
export type FigureType = FigureTypeValue | keyof typeof FigureType

export const PlayerColor = {
  White: 1,
  Black: 2,
} as const
export type PlayerColorValue = (typeof PlayerColor)[keyof typeof PlayerColor]
export type PlayerColor = PlayerColorValue | keyof typeof PlayerColor

export const SkinRarity = {
  Common: 1,
  Rare: 2,
  Legendary: 3,
} as const
export type SkinRarityValue = (typeof SkinRarity)[keyof typeof SkinRarity]
export type SkinRarity = SkinRarityValue | keyof typeof SkinRarity

export const GameResult = {
  WhiteVictory: 1,
  BlackVictory: 2,
  Draw: 3,
} as const
export type GameResultValue = (typeof GameResult)[keyof typeof GameResult]
export type GameResult = GameResultValue | keyof typeof GameResult

export const GameTerminationReason = {
  CheckMate: 1,
  StaleMate: 2,
  Resignation: 3,
  Timeout: 4,
  DrawAgreement: 5,
  Disconnect: 6,
} as const
export type GameTerminationReasonValue =
  (typeof GameTerminationReason)[keyof typeof GameTerminationReason]
export type GameTerminationReason =
  | GameTerminationReasonValue
  | keyof typeof GameTerminationReason

export const UserRole = {
  Player: 1,
  Admin: 2,
} as const
export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole]
export type UserRole = UserRoleValue | keyof typeof UserRole

export const MoveAttemptStatus = {
  Success: 1,
  Invalid: 2,
  Timeout: 3,
} as const
export type MoveAttemptStatusValue =
  (typeof MoveAttemptStatus)[keyof typeof MoveAttemptStatus]
export type MoveAttemptStatus =
  | MoveAttemptStatusValue
  | keyof typeof MoveAttemptStatus

export const FriendRequestState = {
  Pending: 1,
  Accepted: 2,
  Rejected: 3,
} as const
export type FriendRequestStateValue =
  (typeof FriendRequestState)[keyof typeof FriendRequestState]
export type FriendRequestState =
  | FriendRequestStateValue
  | keyof typeof FriendRequestState

export const GameInvitationState = {
  Pending: 1,
  Accepted: 2,
  Rejected: 3,
} as const
export type GameInvitationStateValue =
  (typeof GameInvitationState)[keyof typeof GameInvitationState]
export type GameInvitationState =
  | GameInvitationStateValue
  | keyof typeof GameInvitationState

type EnumMap = Record<string, number>
type EnumWireValue<T extends EnumMap> = T[keyof T] | keyof T

function normalizeEnumValue<T extends EnumMap>(
  values: T,
  value: EnumWireValue<T> | null | undefined,
): T[keyof T] | null {
  if (typeof value === 'number') return value as T[keyof T]
  if (typeof value === 'string' && value in values) {
    return values[value] as T[keyof T]
  }
  return null
}

function enumI18nKey<T extends EnumMap>(
  values: T,
  value: EnumWireValue<T> | null | undefined,
): string {
  const normalized = normalizeEnumValue(values, value)
  return normalized === null ? '' : String(normalized)
}

export const normalizeFigureType = (value: FigureType | null | undefined) =>
  normalizeEnumValue(FigureType, value)
export const normalizePlayerColor = (value: PlayerColor | null | undefined) =>
  normalizeEnumValue(PlayerColor, value)
export const normalizeSkinRarity = (value: SkinRarity | null | undefined) =>
  normalizeEnumValue(SkinRarity, value)
export const normalizeGameResult = (value: GameResult | null | undefined) =>
  normalizeEnumValue(GameResult, value)
export const normalizeGameTerminationReason = (
  value: GameTerminationReason | null | undefined,
) => normalizeEnumValue(GameTerminationReason, value)

export const figureTypeI18nKey = (value: FigureType | null | undefined) =>
  enumI18nKey(FigureType, value)
export const skinRarityI18nKey = (value: SkinRarity | null | undefined) =>
  enumI18nKey(SkinRarity, value)
