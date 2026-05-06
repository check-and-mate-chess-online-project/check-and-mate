import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { toast } from 'sonner'
import type { GameDto, Move as ApiMove } from '../shared/api'
import { GameTerminationReason } from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'

type Color = 'white' | 'black'
type Outcome = 'win' | 'loss' | 'draw'

interface ResultState {
  outcome: Outcome
  reason: GameTerminationReason | null
}

const REASON_KEY: Record<GameTerminationReason, string> = {
  [GameTerminationReason.CheckMate]: 'checkmate',
  [GameTerminationReason.StaleMate]: 'stalemate',
  [GameTerminationReason.Resignation]: 'resignation',
  [GameTerminationReason.Timeout]: 'timeout',
  [GameTerminationReason.DrawAgreement]: 'drawAgreement',
  [GameTerminationReason.Disconnect]: 'disconnect',
}

interface ClockProps {
  label: string
  ms: number
  active: boolean
}

function Clock({ label, ms, active }: ClockProps) {
  const lowTime = ms < 30_000
  return (
    <div
      className={`px-4 py-2 rounded-md border ${
        active ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800'
      }`}
    >
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div
        className={`text-2xl font-mono tabular-nums ${
          lowTime ? 'text-red-400' : 'text-slate-100'
        }`}
      >
        {formatClock(ms)}
      </div>
    </div>
  )
}

function coordToSquare(col: number, row: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

function squareToCoord(sq: string): { col: number; row: number } {
  return { col: sq.charCodeAt(0) - 97, row: parseInt(sq[1], 10) - 1 }
}

function apiMoveToSquares(move: ApiMove): { from: string; to: string } {
  return {
    from: coordToSquare(move.a, move.b),
    to: coordToSquare(move.x, move.y),
  }
}

function squaresToApiMove(from: string, to: string): ApiMove {
  const f = squareToCoord(from)
  const t = squareToCoord(to)
  return { a: f.col, b: f.row, x: t.col, y: t.row, options: [] }
}

interface ResultModalProps {
  result: ResultState
  onClose: () => void
}

function ResultModal({ result, onClose }: ResultModalProps) {
  const { t } = useTranslation()
  const titleClass =
    result.outcome === 'win'
      ? 'text-orange-400'
      : result.outcome === 'loss'
        ? 'text-violet-300'
        : 'text-slate-200'
  const reasonText =
    result.reason !== null
      ? t(`pages.game.reason.${REASON_KEY[result.reason]}`)
      : t('pages.game.gameEnded')
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
      <div className="bg-slate-900 border border-violet-900 rounded-lg p-8 text-center max-w-sm">
        <h2 className={`text-3xl mb-2 ${titleClass}`}>
          {t(`pages.game.result.${result.outcome}`)}
        </h2>
        <p className="text-slate-400 mb-6">{reasonText}</p>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-md"
        >
          {t('nav.lobby')}
        </button>
      </div>
    </div>
  )
}

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuth()

  const game = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(game.fen())
  const [turn, setTurn] = useState<Color>('white')
  const [ended, setEnded] = useState<ResultState | null>(null)
  const clockKickedRef = useRef<string | null>(null)

  const cachedGame = qc.getQueryData<GameDto>(['game', gameId])
  const initialMs = (cachedGame?.initialTimeSec ?? 300) * 1000
  const incMs = (cachedGame?.incrementPerMoveSec ?? 0) * 1000
  const { whiteMs, blackMs, active, switchTo, pause } = useChessClock(
    initialMs,
    incMs,
  )

  const myColor: Color | null = !user || !cachedGame
    ? null
    : user.id === cachedGame.whitePlayerId
      ? 'white'
      : user.id === cachedGame.blackPlayerId
        ? 'black'
        : null

  useEffect(() => {
    if (!cachedGame || ended) return
    if (clockKickedRef.current === cachedGame.id) return
    clockKickedRef.current = cachedGame.id
    switchTo('white')
  }, [cachedGame, ended, switchTo])

  useEffect(() => {
    if (!cachedGame || !myColor) return
    return subscribeGameHub({
      onMoveMade: (move, result) => {
        const { from, to } = apiMoveToSquares(move)
        try {
          game.move({ from, to, promotion: 'q' })
          setFen(game.fen())
          if (result.isGameOver) {
            const moverColor: Color = game.turn() === 'w' ? 'black' : 'white'
            const reason = result.terminationReason
            const outcome: Outcome =
              reason === GameTerminationReason.StaleMate ||
              reason === GameTerminationReason.DrawAgreement
                ? 'draw'
                : moverColor === myColor
                  ? 'win'
                  : 'loss'
            setEnded({ outcome, reason })
            pause()
            return
          }
          const nextTurn = game.turn() === 'w' ? 'white' : 'black'
          setTurn(nextTurn)
          switchTo(nextTurn)
        } catch {
          return
        }
      },
      onUserDisconnected: (userId) => {
        if (userId === user?.id) return
        toast.warning(t('pages.game.opponentDisconnected'))
        setEnded({ outcome: 'win', reason: GameTerminationReason.Disconnect })
        pause()
      },
      onGameEnded: () => {
        setEnded((prev) =>
          prev ?? { outcome: 'win', reason: GameTerminationReason.Resignation },
        )
        pause()
      },
      onTimeExpired: (_gameId, userId) => {
        const outcome: Outcome = userId === user?.id ? 'loss' : 'win'
        setEnded({ outcome, reason: GameTerminationReason.Timeout })
        pause()
      },
    })
  }, [cachedGame, myColor, user?.id, t, game, switchTo, pause])

  if (!cachedGame || !myColor) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{t('pages.game.notFound')}</p>
          <Link
            to="/lobby"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-md"
          >
            ← {t('nav.lobby')}
          </Link>
        </div>
      </div>
    )
  }

  const isMyTurn = turn === myColor

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) => {
    if (!targetSquare) return false
    if (!isMyTurn) return false
    const preview = new Chess(game.fen())
    try {
      preview.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
    } catch {
      return false
    }
    const apiMove = squaresToApiMove(sourceSquare, targetSquare)
    gameHub.makeMove(apiMove).catch(() => {
      toast.error('move rejected')
    })
    return false
  }

  const handleResign = async () => {
    if (!confirm(t('pages.game.resignConfirm'))) return
    try {
      await gameHub.resign()
      setEnded({ outcome: 'loss', reason: GameTerminationReason.Resignation })
      pause()
    } catch {
      toast.error('resign failed')
    }
  }

  const handleExit = () => {
    if (ended) {
      navigate('/lobby')
      return
    }
    if (!confirm(t('pages.game.exitConfirm'))) return
    gameHub.resign().catch(() => {})
    navigate('/lobby')
  }

  const opponentColor: Color = myColor === 'white' ? 'black' : 'white'

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-violet-900">
        <button
          type="button"
          onClick={handleExit}
          className="text-slate-400 hover:text-slate-100 text-sm"
        >
          ← {t('pages.game.exit')}
        </button>
        <span className="text-sm text-slate-500">
          {isMyTurn ? t('pages.game.yourTurn') : t('pages.game.opponentTurn')}
        </span>
        <button
          type="button"
          onClick={handleResign}
          disabled={!!ended}
          className="text-sm text-orange-400 hover:text-orange-300 disabled:opacity-40"
        >
          {t('pages.game.resign')}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl flex flex-col gap-3">
          <Clock
            label={`${t('pages.game.opponent')} (${opponentColor})`}
            ms={opponentColor === 'white' ? whiteMs : blackMs}
            active={active === opponentColor}
          />
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              boardOrientation: myColor,
              boardStyle: {
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              },
              darkSquareStyle: { backgroundColor: '#4c1d95' },
              lightSquareStyle: { backgroundColor: '#e5e7eb' },
            }}
          />
          <Clock
            label={`${t('pages.game.you')} (${myColor})`}
            ms={myColor === 'white' ? whiteMs : blackMs}
            active={active === myColor}
          />
        </div>
      </main>

      {ended && (
        <ResultModal result={ended} onClose={() => navigate('/lobby')} />
      )}
    </div>
  )
}
