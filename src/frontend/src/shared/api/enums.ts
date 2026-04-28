// значения совпадают с ordinals C# enum'ов на бэке

export const FigureType = {
  King: 1,
  Queen: 2,
  Rook: 3,
  Bishop: 4,
  Knight: 5,
  Pawn: 6,
} as const
export type FigureType = (typeof FigureType)[keyof typeof FigureType]

export const PlayerColor = {
  White: 1,
  Black: 2,
} as const
export type PlayerColor = (typeof PlayerColor)[keyof typeof PlayerColor]

export const SkinRarity = {
  Common: 1,
  Rare: 2,
  Legendary: 3,
} as const
export type SkinRarity = (typeof SkinRarity)[keyof typeof SkinRarity]

export const GameResult = {
  WhiteVictory: 1,
  BlackVictory: 2,
  Draw: 3,
} as const
export type GameResult = (typeof GameResult)[keyof typeof GameResult]

export const GameTerminationReason = {
  CheckMate: 1,
  StaleMate: 2,
  Resignation: 3,
  Timeout: 4,
  DrawAgreement: 5,
  Disconnect: 6,
} as const
export type GameTerminationReason =
  (typeof GameTerminationReason)[keyof typeof GameTerminationReason]

export const UserRole = {
  Player: 1,
  Admin: 2,
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]
