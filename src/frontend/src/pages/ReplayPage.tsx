import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Chess } from 'chess.js'
import type { MoveDto, PlyDto } from '../shared/api'
import {
  FigureType,
  GameResult,
  GameTerminationReason,
  PlayerColor,
} from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { useGameHistory } from '../shared/api/hooks'
import { Chessboard } from '../shared/ui/Chessboard/Chessboard'

const REASON_KEY: Record<GameTerminationReason, string> = {
  [GameTerminationReason.CheckMate]: 'checkmate',
  [GameTerminationReason.StaleMate]: 'stalemate',
  [GameTerminationReason.Resignation]: 'resignation',
  [GameTerminationReason.Timeout]: 'timeout',
  [GameTerminationReason.DrawAgreement]: 'drawAgreement',
  [GameTerminationReason.Disconnect]: 'disconnect',
}

function coordToSquare(col: number, row: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

const PROMOTION_CHAR: Record<number, 'q' | 'r' | 'b' | 'n'> = {
  [FigureType.Queen]: 'q',
  [FigureType.Rook]: 'r',
  [FigureType.Bishop]: 'b',
  [FigureType.Knight]: 'n',
}

function plyToChessMove(ply: PlyDto): {
  from: string
  to: string
  promotion?: 'q' | 'r' | 'b' | 'n'
} | null {
  const coord: MoveDto | undefined = ply.coordinates[0]
  if (!coord) return null
  return {
    from: coordToSquare(coord.a, coord.b),
    to: coordToSquare(coord.x, coord.y),
    promotion: coord.options.selectedFigure
      ? PROMOTION_CHAR[coord.options.selectedFigure]
      : undefined,
  }
}

interface AppliedPly {
  san: string
  fen: string
  moveNumber: number
  color: PlayerColor
}

function applyPlies(plies: PlyDto[]): AppliedPly[] {
  const chess = new Chess()
  const out: AppliedPly[] = []
  for (const ply of plies) {
    const move = plyToChessMove(ply)
    if (!move) continue
    try {
      const applied = chess.move(move)
      out.push({
        san: applied.san,
        fen: chess.fen(),
        moveNumber: ply.moveNumber,
        color: ply.color,
      })
    } catch {
      break
    }
  }
  return out
}

const INITIAL_FEN = new Chess().fen()

export function ReplayPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: games, isLoading } = useGameHistory()
  const game = games?.find((g) => g.id === gameId)

  const sortedPlies = useMemo<PlyDto[]>(() => {
    if (!game?.moves) return []
    return [...game.moves].sort((a, b) => {
      if (a.moveNumber !== b.moveNumber) return a.moveNumber - b.moveNumber
      return a.color === PlayerColor.White ? -1 : 1
    })
  }, [game])

  const applied = useMemo(() => applyPlies(sortedPlies), [sortedPlies])
  const [cursor, setCursor] = useState(0)

  const totalPlies = applied.length
  const safeCursor = Math.min(cursor, totalPlies)
  const fen = safeCursor === 0 ? INITIAL_FEN : applied[safeCursor - 1].fen

  if (isLoading) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <p className="text-slate-500">...</p>
      </div>
    )
  }

  if (!game || !user) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{t('pages.replay.notFound')}</p>
          <Link
            to="/history"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-md"
          >
            ← {t('nav.profileItems.history')}
          </Link>
        </div>
      </div>
    )
  }

  const myColor = game.whitePlayerId === user.id ? 'white' : 'black'
  const opponentId =
    game.whitePlayerId === user.id ? game.blackPlayerId : game.whitePlayerId
  const outcome =
    game.result === GameResult.Draw
      ? 'draw'
      : (game.result === GameResult.WhiteVictory) === (myColor === 'white')
        ? 'win'
        : 'loss'
  const reasonText = game.terminationReason !== null
    ? t(`pages.game.reason.${REASON_KEY[game.terminationReason]}`)
    : ''

  // Pair plies into rounds: [{whitePly, blackPly?}]
  const rounds: Array<{ moveNumber: number; white?: AppliedPly; black?: AppliedPly }> = []
  for (const a of applied) {
    let round = rounds.find((r) => r.moveNumber === a.moveNumber)
    if (!round) {
      round = { moveNumber: a.moveNumber }
      rounds.push(round)
    }
    if (a.color === PlayerColor.White) round.white = a
    else round.black = a
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/history" className="text-slate-400 hover:text-slate-100 text-sm">
          ← {t('nav.profileItems.history')}
        </Link>
        <div className="text-sm text-slate-400">
          <span
            className={
              outcome === 'win'
                ? 'text-orange-400'
                : outcome === 'loss'
                  ? 'text-violet-300'
                  : 'text-slate-200'
            }
          >
            {t(`pages.game.result.${outcome}`)}
          </span>
          <span className="text-slate-500"> · {reasonText}</span>
          <span className="text-slate-500"> · vs </span>
          <span className="font-mono text-slate-300">
            {opponentId.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-full max-w-xl">
          <Chessboard
            options={{
              position: fen,
              boardOrientation: myColor,
              allowDragging: false,
              boardStyle: { borderRadius: '12px' },
              darkSquareStyle: { backgroundColor: '#4c1d95' },
              lightSquareStyle: { backgroundColor: '#e5e7eb' },
            }}
          />

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCursor(0)}
              disabled={safeCursor === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md text-slate-200"
            >
              ⏮
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => Math.max(0, c - 1))}
              disabled={safeCursor === 0}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md text-slate-200"
            >
              ◀
            </button>
            <span className="px-3 text-sm text-slate-400 font-mono tabular-nums">
              {safeCursor} / {totalPlies}
            </span>
            <button
              type="button"
              onClick={() => setCursor((c) => Math.min(totalPlies, c + 1))}
              disabled={safeCursor === totalPlies}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md text-slate-200"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={() => setCursor(totalPlies)}
              disabled={safeCursor === totalPlies}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-md text-slate-200"
            >
              ⏭
            </button>
          </div>
        </div>

        <aside className="w-72 max-h-[80vh] overflow-y-auto bg-slate-900/40 border border-slate-800 rounded-md p-3">
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-1 text-sm font-mono">
            {rounds.map((round) => {
              const whiteIdx = applied.findIndex(
                (p) => p.moveNumber === round.moveNumber && p.color === PlayerColor.White,
              ) + 1
              const blackIdx = applied.findIndex(
                (p) => p.moveNumber === round.moveNumber && p.color === PlayerColor.Black,
              ) + 1
              return (
                <div key={round.moveNumber} className="contents">
                  <span className="text-slate-500">{round.moveNumber}.</span>
                  <button
                    type="button"
                    onClick={() => round.white && setCursor(whiteIdx)}
                    disabled={!round.white}
                    className={`text-left px-2 rounded ${
                      round.white && safeCursor === whiteIdx
                        ? 'bg-violet-600/30 text-violet-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {round.white?.san ?? '—'}
                  </button>
                  <button
                    type="button"
                    onClick={() => round.black && setCursor(blackIdx)}
                    disabled={!round.black}
                    className={`text-left px-2 rounded ${
                      round.black && safeCursor === blackIdx
                        ? 'bg-violet-600/30 text-violet-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {round.black?.san ?? ''}
                  </button>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
