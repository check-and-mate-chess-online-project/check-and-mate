import { Chess } from 'chess.js'
import type { MoveDto, PlyDto } from '../api'
import { FigureType, normalizeFigureType, normalizePlayerColor } from '../api/enums'

const PROMOTION_CHAR: Record<number, 'q' | 'r' | 'b' | 'n'> = {
  [FigureType.Queen]: 'q',
  [FigureType.Rook]: 'r',
  [FigureType.Bishop]: 'b',
  [FigureType.Knight]: 'n',
}

export interface AppliedPly {
  san: string
  fen: string
  moveNumber: number
  color: number
  captured?: string
  mover: 'w' | 'b'
}

export interface Round {
  moveNumber: number
  white?: AppliedPly
  black?: AppliedPly
}

export const INITIAL_FEN = new Chess().fen()

function coordToSquare(col: number, row: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

function plyToChessMove(ply: PlyDto): {
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
} | null {
  const coord: MoveDto | undefined = ply.move ?? ply.coordinates?.[0]
  if (!coord) return null
  return {
    from: coordToSquare(coord.a, coord.b),
    to: coordToSquare(coord.x, coord.y),
    promotion: coord.options?.selectedFigure
      ? PROMOTION_CHAR[normalizeFigureType(coord.options.selectedFigure) ?? 0]
      : undefined,
  }
}

export function sortPlies(plies: PlyDto[]): PlyDto[] {
  return [...plies].sort((a, b) => {
    if (a.moveNumber !== b.moveNumber) return a.moveNumber - b.moveNumber
    return normalizePlayerColor(a.color) === 1 ? -1 : 1
  })
}

export function applyPlies(plies: PlyDto[]): AppliedPly[] {
  const chess = new Chess()
  const out: AppliedPly[] = []
  for (const ply of plies) {
    const move = plyToChessMove(ply)
    const color = normalizePlayerColor(ply.color)
    if (!move || color === null) continue
    try {
      const applied = chess.move(move)
      out.push({
        san: applied.san,
        fen: chess.fen(),
        moveNumber: ply.moveNumber,
        color,
        captured: applied.captured,
        mover: applied.color,
      })
    } catch {
      break
    }
  }
  return out
}

export function pairRounds(applied: AppliedPly[]): Round[] {
  const rounds: Round[] = []
  for (const a of applied) {
    let round = rounds.find((r) => r.moveNumber === a.moveNumber)
    if (!round) {
      round = { moveNumber: a.moveNumber }
      rounds.push(round)
    }
    if (a.color === 1) round.white = a
    else round.black = a
  }
  return rounds
}
