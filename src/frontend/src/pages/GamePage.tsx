import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard } from '../shared/ui/Chessboard/Chessboard'
import { toast } from 'sonner'
import type { GameDto, MakeMoveRequest } from '../shared/api'
import { FigureType, GameTerminationReason } from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'
import { useEquippedSkinsStore } from '../shared/lib/equippedSkins'
import { FightAnimation, type FightPiece } from '../shared/ui/FightAnimation'
import { ConfirmModal } from '../shared/ui/ConfirmModal'

type Color = 'white' | 'black'
type Outcome = 'win' | 'loss' | 'draw'

interface ResultState {
  outcome: Outcome
  reason: GameTerminationReason | null
}

const CHESS_TO_FIGURE: Record<string, FigureType> = {
  k: FigureType.King,
  q: FigureType.Queen,
  r: FigureType.Rook,
  b: FigureType.Bishop,
  n: FigureType.Knight,
  p: FigureType.Pawn,
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
  ms: number
  active: boolean
  login: string
}

function Clock({ ms, active, login }: ClockProps) {
  const lowTime = ms < 30_000
  return (
    <div
      className={`flex items-center justify-between px-5 py-3 rounded-md border ${
        active ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800'
      }`}
    >
      <div
        className={`text-4xl font-mono tabular-nums leading-none ${
          lowTime ? 'text-red-400' : 'text-slate-100'
        }`}
      >
        {formatClock(ms)}
      </div>
      <div className="text-sm text-slate-300 truncate ml-4">{login}</div>
    </div>
  )
}

function coordToSquare(col: number, row: number): string {
  return String.fromCharCode(97 + col) + (row + 1)
}

function squareToCoord(sq: string): { col: number; row: number } {
  return { col: sq.charCodeAt(0) - 97, row: parseInt(sq[1], 10) - 1 }
}

function apiMoveToSquares(move: MakeMoveRequest): { from: string; to: string } {
  return {
    from: coordToSquare(move.a, move.b),
    to: coordToSquare(move.x, move.y),
  }
}

function squaresToApiMove(from: string, to: string): MakeMoveRequest {
  const f = squareToCoord(from)
  const t = squareToCoord(to)
  return {
    a: f.col,
    b: f.row,
    x: t.col,
    y: t.row,
    options: { selectedFigure: null },
  }
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
  const [gameHasStarted, setGameHasStarted] = useState(false)
  const [fightQueue, setFightQueue] = useState<
    Array<{
      attacker: FightPiece
      victim: FightPiece
      key: number
    }>
  >([])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<
    | {
        message: string
        title?: string
        confirmLabel?: string
        danger?: boolean
        onConfirm: () => void
      }
    | null
  >(null)
  const equipped = useEquippedSkinsStore((s) => s.equipped)

  const cachedGame = qc.getQueryData<GameDto>(['game', gameId])
  const initialMs = (cachedGame?.initialTimeSec ?? 300) * 1000
  const incMs = (cachedGame?.incrementPerMoveSec ?? 0) * 1000
  const { whiteMs, blackMs, active, switchTo, pause } = useChessClock(
    initialMs,
    incMs,
  )

  const myColor: Color | null = !user || !cachedGame
    ? null
    : user.id === cachedGame.whitePlayer.id
      ? 'white'
      : user.id === cachedGame.blackPlayer.id
        ? 'black'
        : null

  useEffect(() => {
    if (!cachedGame || !myColor) return
    return subscribeGameHub({
      onMoveMade: (move, result) => {
        const { from, to } = apiMoveToSquares(move)
        try {
          const applied = game.move({ from, to, promotion: 'q' })
          setFen(game.fen())
          setGameHasStarted(true)
          if (applied.captured) {
            const attackerColor: Color =
              applied.color === 'w' ? 'white' : 'black'
            const victimColor: Color =
              attackerColor === 'white' ? 'black' : 'white'
            const attackerFigure = CHESS_TO_FIGURE[applied.piece]
            const victimFigure = CHESS_TO_FIGURE[applied.captured]
            if (attackerFigure && victimFigure) {
              setFightQueue((q) => [
                ...q,
                {
                  attacker: { figure: attackerFigure, color: attackerColor },
                  victim: { figure: victimFigure, color: victimColor },
                  key: Date.now() + Math.random(),
                },
              ])
            }
          }
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
      onMoveRejected: () => {
        toast.error('move rejected')
      },
      onPlayerResigned: (_game, userId) => {
        const outcome: Outcome = userId === user?.id ? 'loss' : 'win'
        setEnded({ outcome, reason: GameTerminationReason.Resignation })
        pause()
      },
      onPlayerLeft: (_game, userId) => {
        if (userId === user?.id) return
        toast.warning(t('pages.game.opponentDisconnected'))
        setEnded({ outcome: 'win', reason: GameTerminationReason.Disconnect })
        pause()
      },
      onTimeExpired: (_game, userId) => {
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
  const opponentColor: Color = myColor === 'white' ? 'black' : 'white'
  const opponentLogin =
    cachedGame &&
    (myColor === 'white'
      ? cachedGame.blackPlayer.login
      : cachedGame.whitePlayer.login)

  const squareStyles: Record<string, React.CSSProperties> = (() => {
    if (!selectedSquare) return {}
    const styles: Record<string, React.CSSProperties> = {}
    try {
      const legalMoves = game.moves({ square: selectedSquare as never, verbose: true })
      for (const m of legalMoves as Array<{ to: string; captured?: string }>) {
        styles[m.to] = m.captured
          ? { boxShadow: 'inset 0 0 0 5px rgba(251,146,60,0.75)' }
          : {
              background:
                'radial-gradient(circle, rgba(251,146,60,0.55) 25%, transparent 28%)',
            }
      }
    } catch {
      // selected square may have no piece anymore
    }
    return styles
  })()

  const onPieceDrag = ({
    square,
  }: {
    square: string | null
  }) => {
    if (!isMyTurn || !square) return
    setSelectedSquare(square)
  }

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) => {
    setSelectedSquare(null)
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
      toast.error('move failed')
    })
    return false
  }

  const handleResign = () => {
    setPendingConfirm({
      message: t('pages.game.resignConfirm'),
      confirmLabel: t('pages.game.resign'),
      danger: true,
      onConfirm: async () => {
        setPendingConfirm(null)
        try {
          await gameHub.resign()
        } catch {
          toast.error('resign failed')
        }
      },
    })
  }

  const exitToLobby = () => {
    qc.invalidateQueries({ queryKey: ['me'] })
    navigate('/lobby')
  }

  const handleExit = () => {
    if (ended) {
      exitToLobby()
      return
    }
    if (!gameHasStarted) {
      setPendingConfirm({
        message: t('pages.game.leaveMatchConfirm'),
        confirmLabel: t('pages.game.exit'),
        onConfirm: async () => {
          setPendingConfirm(null)
          try { await gameHub.leave() } catch { /* ignore */ }
          exitToLobby()
        },
      })
      return
    }
    setPendingConfirm({
      message: t('pages.game.exitConfirm'),
      confirmLabel: t('pages.game.exit'),
      danger: true,
      onConfirm: async () => {
        setPendingConfirm(null)
        try { await gameHub.resign() } catch { /* ignore */ }
        exitToLobby()
      },
    })
  }

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
          disabled={!!ended || !gameHasStarted}
          title={!gameHasStarted ? t('pages.game.resignDisabledHint') : undefined}
          className="text-sm text-orange-400 hover:text-orange-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('pages.game.resign')}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl flex flex-col gap-3">
          <Clock
            ms={opponentColor === 'white' ? whiteMs : blackMs}
            active={active === opponentColor}
            login={opponentLogin}
          />
          <Chessboard
            options={{
              position: fen,
              onPieceDrop,
              onPieceDrag,
              boardOrientation: myColor,
              squareStyles,
              boardStyle: {
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              },
              darkSquareStyle: { backgroundColor: '#4c1d95' },
              lightSquareStyle: { backgroundColor: '#e5e7eb' },
            }}
          />
          <Clock
            ms={myColor === 'white' ? whiteMs : blackMs}
            active={active === myColor}
            login={user?.login ?? ''}
          />
        </div>
      </main>

      {ended && (
        <ResultModal result={ended} onClose={exitToLobby} />
      )}

      {pendingConfirm && (
        <ConfirmModal
          title={pendingConfirm.title}
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          danger={pendingConfirm.danger}
          onConfirm={pendingConfirm.onConfirm}
          onCancel={() => setPendingConfirm(null)}
        />
      )}

      {fightQueue.length > 0 && (
        <FightAnimation
          key={fightQueue[0].key}
          attacker={fightQueue[0].attacker}
          victim={fightQueue[0].victim}
          attackerSkinId={equipped[fightQueue[0].attacker.figure]}
          victimSkinId={equipped[fightQueue[0].victim.figure]}
          onComplete={() => setFightQueue((q) => q.slice(1))}
        />
      )}
    </div>
  )
}
