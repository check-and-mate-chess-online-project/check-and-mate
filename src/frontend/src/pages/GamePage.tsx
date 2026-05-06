import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { toast } from 'sonner'
import type { GameDto, Move as ApiMove } from '../shared/api'
import { useAuth } from '../shared/auth/useAuth'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'

type Color = 'white' | 'black'

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
  return String.fromCharCode(96 + col) + row
}

function squareToCoord(sq: string): { col: number; row: number } {
  return { col: sq.charCodeAt(0) - 96, row: parseInt(sq[1], 10) }
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
  message: string
  onClose: () => void
}

function ResultModal({ message, onClose }: ResultModalProps) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
      <div className="bg-slate-900 border border-violet-900 rounded-lg p-8 text-center max-w-sm">
        <h2 className="text-2xl mb-4">{t('pages.game.gameEnded')}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
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
  const [ended, setEnded] = useState<string | null>(null)
  const opponentLeftRef = useRef(false)

  const cachedGame = qc.getQueryData<GameDto>(['game', gameId])
  const initialMs = (cachedGame?.initialTimeSec ?? 300) * 1000
  const incMs = (cachedGame?.incrementPerMoveSec ?? 0) * 1000
  const clock = useChessClock(initialMs, incMs)

  const myColor: Color | null = !user || !cachedGame
    ? null
    : user.id === cachedGame.whitePlayerId
      ? 'white'
      : user.id === cachedGame.blackPlayerId
        ? 'black'
        : null

  useEffect(() => {
    if (!cachedGame) return
    return subscribeGameHub({
      onMoveMade: (move) => {
        const { from, to } = apiMoveToSquares(move)
        try {
          game.move({ from, to, promotion: 'q' })
          setFen(game.fen())
          clock.switchTo(game.turn() === 'w' ? 'white' : 'black')
        } catch {
          // ход уже применён (вероятно свой) — игнорируем
        }
      },
      onUserDisconnected: (userId) => {
        if (myColor && userId !== user?.id) {
          opponentLeftRef.current = true
          toast.warning(t('pages.game.opponentDisconnected'))
        }
      },
      onGameEnded: () => {
        setEnded(t('pages.game.gameEnded'))
        clock.pause()
      },
      onTimeExpired: () => {
        setEnded(t('pages.game.gameEnded'))
        clock.pause()
      },
    })
  }, [cachedGame, myColor, user?.id, t, game, clock])

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

  const isMyTurn = game.turn() === myColor[0]

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) => {
    if (!targetSquare) return false
    if (!isMyTurn) return false
    let applied
    try {
      applied = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })
    } catch {
      return false
    }
    if (!applied) return false
    setFen(game.fen())
    clock.switchTo(game.turn() === 'w' ? 'white' : 'black')
    const apiMove = squaresToApiMove(sourceSquare, targetSquare)
    gameHub.makeMove(apiMove).catch(() => {
      // откат при ошибке сервера
      game.undo()
      setFen(game.fen())
      toast.error('move rejected')
    })
    return true
  }

  const handleResign = async () => {
    if (!confirm(t('pages.game.resignConfirm'))) return
    try {
      await gameHub.resign()
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
            ms={opponentColor === 'white' ? clock.whiteMs : clock.blackMs}
            active={clock.active === opponentColor}
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
            ms={myColor === 'white' ? clock.whiteMs : clock.blackMs}
            active={clock.active === myColor}
          />
        </div>
      </main>

      {ended && (
        <ResultModal message={ended} onClose={() => navigate('/lobby')} />
      )}
    </div>
  )
}
