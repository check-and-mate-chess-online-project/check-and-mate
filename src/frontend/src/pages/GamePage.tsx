import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Chess } from 'chess.js'
import { Chessboard } from '../shared/ui/Chessboard/Chessboard'
import { toast } from 'sonner'
import type { GameDto, MakeMoveRequest, MoveDto, PlyDto } from '../shared/api'
import {
  FigureType,
  GameResult,
  GameTerminationReason,
  normalizeFigureType,
  normalizeGameResult,
  normalizeGameTerminationReason,
  normalizePlayerColor,
} from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'
import { useEquippedSkinsStore } from '../shared/lib/equippedSkins'
import { FightAnimation, type FightPiece } from '../shared/ui/FightAnimation'
import { ConfirmModal } from '../shared/ui/ConfirmModal'
import { playSound } from '../shared/lib/sound'

type Color = 'white' | 'black'
type Outcome = 'win' | 'loss' | 'draw' | 'cancelled'

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

const REASON_KEY: Record<number, string> = {
  [GameTerminationReason.CheckMate]: 'checkmate',
  [GameTerminationReason.StaleMate]: 'stalemate',
  [GameTerminationReason.Resignation]: 'resignation',
  [GameTerminationReason.Timeout]: 'timeout',
  [GameTerminationReason.DrawAgreement]: 'drawAgreement',
  [GameTerminationReason.Disconnect]: 'disconnect',
}

const PROMOTION_CHAR: Record<number, 'q' | 'r' | 'b' | 'n'> = {
  [FigureType.Queen]: 'q',
  [FigureType.Rook]: 'r',
  [FigureType.Bishop]: 'b',
  [FigureType.Knight]: 'n',
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

function apiMoveToSquares(move: Pick<MoveDto, 'a' | 'b' | 'x' | 'y'>): {
  from: string
  to: string
} {
  return {
    from: coordToSquare(move.a, move.b),
    to: coordToSquare(move.x, move.y),
  }
}

function promotionFromMove(
  move: Pick<MoveDto, 'options'>,
): 'q' | 'r' | 'b' | 'n' | undefined {
  const figure = normalizeFigureType(move.options?.selectedFigure)
  return figure === null ? undefined : PROMOTION_CHAR[figure]
}

function sortPlies(plies: PlyDto[]): PlyDto[] {
  return [...plies].sort((a, b) => {
    if (a.moveNumber !== b.moveNumber) return a.moveNumber - b.moveNumber
    return normalizePlayerColor(a.color) === 1 ? -1 : 1
  })
}

function firstPlyMove(ply: PlyDto): MoveDto | undefined {
  return ply.move ?? ply.coordinates?.[0]
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
  const reason = normalizeGameTerminationReason(result.reason)
  const titleClass =
    result.outcome === 'win'
      ? 'text-orange-400'
      : result.outcome === 'loss'
        ? 'text-violet-300'
        : result.outcome === 'cancelled'
          ? 'text-slate-300'
          : 'text-slate-200'
  const reasonText =
    result.outcome === 'cancelled'
      ? t('pages.game.reason.cancelled')
      : reason !== null
        ? t(`pages.game.reason.${REASON_KEY[reason]}`)
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
  const [pendingConfirm, setPendingConfirm] = useState<{
    message: string
    title?: string
    confirmLabel?: string
    danger?: boolean
    onConfirm: () => void
  } | null>(null)
  const equipped = useEquippedSkinsStore((s) => s.equipped)
  const pendingMoveRef = useRef<{ from: string; to: string } | null>(null)

  const cachedGame = qc.getQueryData<GameDto>(['game', gameId])
  const [activeGame, setActiveGame] = useState<GameDto | undefined>(cachedGame)
  const [loadingGame, setLoadingGame] = useState(!cachedGame)
  const initialMs = (activeGame?.initialTimeSec ?? 300) * 1000
  const incMs = (activeGame?.incrementPerMoveSec ?? 0) * 1000
  const { whiteMs, blackMs, active, switchTo, pause, reset, setTimes } =
    useChessClock(initialMs, incMs)

  const setTimesRef = useRef(setTimes)
  useEffect(() => {
    setTimesRef.current = setTimes
  }, [setTimes])
  const syncClocksFromGame = useMemo(
    () => (g: GameDto | null | undefined) => {
      if (!g || !g.timeControlIsEnabled) return
      if (
        g.whiteTimeLeftSec === null ||
        g.whiteTimeLeftSec === undefined ||
        g.blackTimeLeftSec === null ||
        g.blackTimeLeftSec === undefined
      )
        return
      setTimesRef.current(
        Math.max(0, g.whiteTimeLeftSec * 1000),
        Math.max(0, g.blackTimeLeftSec * 1000),
      )
    },
    [],
  )

  const myColor: Color | null =
    !user || !activeGame
      ? null
      : user.id === activeGame.whitePlayer.id
        ? 'white'
        : user.id === activeGame.blackPlayer.id
          ? 'black'
          : null

  useEffect(() => {
    if (!gameId || activeGame || !user) return
    let ignore = false
    gameHub
      .getActiveGameState()
      .then((nextGame) => {
        if (ignore || !nextGame || nextGame.id !== gameId) return
        qc.setQueryData(['game', nextGame.id], nextGame)
        setActiveGame(nextGame)
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoadingGame(false)
      })
    return () => {
      ignore = true
    }
  }, [activeGame, gameId, qc, user])

  useEffect(() => {
    if (!activeGame || !myColor) return
    const id = window.setTimeout(() => {
      game.reset()
      reset()
      let appliedCount = 0
      for (const ply of sortPlies(activeGame.moves ?? [])) {
        const move = firstPlyMove(ply)
        if (!move) continue
        const { from, to } = apiMoveToSquares(move)
        try {
          game.move({
            from,
            to,
            promotion: promotionFromMove(move) ?? 'q',
          })
          appliedCount += 1
        } catch {
          break
        }
      }
      setFen(game.fen())
      const nextTurn = game.turn() === 'w' ? 'white' : 'black'
      setTurn(nextTurn)
      setGameHasStarted(appliedCount > 0)

      const result = normalizeGameResult(activeGame.result)
      const reason = normalizeGameTerminationReason(
        activeGame.terminationReason,
      )
      if (result !== null) {
        const outcome: Outcome =
          result === GameResult.Draw
            ? 'draw'
            : (result === GameResult.WhiteVictory) === (myColor === 'white')
              ? 'win'
              : 'loss'
        setEnded({ outcome, reason })
        pause()
        return
      }

      setEnded(null)
      if (appliedCount > 0) {
        if (
          activeGame.timeControlIsEnabled &&
          activeGame.whiteTimeLeftSec !== null &&
          activeGame.whiteTimeLeftSec !== undefined &&
          activeGame.blackTimeLeftSec !== null &&
          activeGame.blackTimeLeftSec !== undefined
        ) {
          setTimes(
            Math.max(0, activeGame.whiteTimeLeftSec * 1000),
            Math.max(0, activeGame.blackTimeLeftSec * 1000),
          )
        }
        switchTo(nextTurn)
      } else pause()
    }, 0)
    return () => window.clearTimeout(id)
  }, [activeGame, myColor, game, reset, switchTo, pause, setTimes])

  useEffect(() => {
    if (!activeGame || !myColor) return
    return subscribeGameHub({
      onMoveMade: (move, result) => {
        const { from, to } = apiMoveToSquares(move)
        const pending = pendingMoveRef.current
        const isOurOptimistic =
          pending && pending.from === from && pending.to === to
        if (isOurOptimistic) {
          pendingMoveRef.current = null
        }
        try {
          const applied = isOurOptimistic
            ? null
            : game.move({
                from,
                to,
                promotion: promotionFromMove(move) ?? 'q',
              })
          setFen(game.fen())
          setGameHasStarted(true)
          if (applied) {
            if (applied.flags.includes('k') || applied.flags.includes('q')) {
              playSound('castle')
            } else if (applied.captured) {
              playSound('capture')
            } else {
              playSound('move')
            }
            if (game.inCheck()) playSound('check')
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
          }
          const serverGame = result.game
          if (result.isGameOver) {
            const moverColor: Color = game.turn() === 'w' ? 'black' : 'white'
            const reason = normalizeGameTerminationReason(
              result.terminationReason,
            )
            const outcome: Outcome =
              reason === GameTerminationReason.StaleMate ||
              reason === GameTerminationReason.DrawAgreement
                ? 'draw'
                : moverColor === myColor
                  ? 'win'
                  : 'loss'
            pause()
            syncClocksFromGame(serverGame)
            setEnded({ outcome, reason })
            playSound('gameEnd')
            return
          }
          const nextTurn = game.turn() === 'w' ? 'white' : 'black'
          setTurn(nextTurn)
          pause()
          syncClocksFromGame(serverGame)
          switchTo(nextTurn)
        } catch {
          return
        }
      },
      onMoveRejected: () => {
        toast.error('move rejected')
        if (pendingMoveRef.current) {
          try {
            game.undo()
            setFen(game.fen())
          } catch {
            // ignore
          }
          pendingMoveRef.current = null
        }
      },
      onPlayerResigned: (gameState, userId) => {
        const outcome: Outcome = userId === user?.id ? 'loss' : 'win'
        pause()
        syncClocksFromGame(gameState)
        setEnded({ outcome, reason: GameTerminationReason.Resignation })
        playSound('gameEnd')
      },
      onPlayerLeft: (gameState, userId) => {
        if (userId === user?.id) return
        toast.warning(t('pages.game.opponentDisconnected'))
        pause()
        syncClocksFromGame(gameState)
        const isCancelled =
          gameState.result === null || gameState.result === undefined
        setEnded({
          outcome: isCancelled ? 'cancelled' : 'win',
          reason: isCancelled ? null : GameTerminationReason.Disconnect,
        })
        playSound('gameEnd')
      },
      onTimeExpired: (gameState, userId) => {
        const outcome: Outcome = userId === user?.id ? 'loss' : 'win'
        pause()
        syncClocksFromGame(gameState)
        setEnded({ outcome, reason: GameTerminationReason.Timeout })
        playSound('gameEnd')
      },
    })
  }, [activeGame, myColor, user?.id, t, game, switchTo, pause, syncClocksFromGame])

  if (loadingGame) {
    return (
      <div className="min-h-screen text-slate-100 flex items-center justify-center">
        <p className="text-slate-500">{t('pages.game.connecting')}</p>
      </div>
    )
  }

  if (!activeGame || !myColor) {
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
    myColor === 'white'
      ? activeGame.blackPlayer.login
      : activeGame.whitePlayer.login

  const squareStyles: Record<string, React.CSSProperties> = (() => {
    if (!selectedSquare) return {}
    const styles: Record<string, React.CSSProperties> = {}
    try {
      const legalMoves = game.moves({
        square: selectedSquare as never,
        verbose: true,
      })
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

  const onPieceDrag = ({ square }: { square: string | null }) => {
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
    setGameHasStarted(true)
    if (applied.flags.includes('k') || applied.flags.includes('q')) {
      playSound('castle')
    } else if (applied.captured) {
      playSound('capture')
    } else {
      playSound('move')
    }
    if (game.inCheck()) playSound('check')
    if (applied.captured) {
      const attackerColor: Color = applied.color === 'w' ? 'white' : 'black'
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
    const nextTurn = game.turn() === 'w' ? 'white' : 'black'
    setTurn(nextTurn)
    switchTo(nextTurn)
    pendingMoveRef.current = { from: sourceSquare, to: targetSquare }
    const apiMove = squaresToApiMove(sourceSquare, targetSquare)
    gameHub.makeMove(apiMove).catch(() => {
      toast.error('move failed')
      try {
        game.undo()
        setFen(game.fen())
        setTurn(game.turn() === 'w' ? 'white' : 'black')
      } catch {
        // ignore
      }
      pendingMoveRef.current = null
    })
    return true
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
          try {
            await gameHub.leave()
          } catch {
            /* ignore */
          }
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
        try {
          await gameHub.resign()
        } catch {
          /* ignore */
        }
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
          title={
            !gameHasStarted ? t('pages.game.resignDisabledHint') : undefined
          }
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

      {ended && <ResultModal result={ended} onClose={exitToLobby} />}

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
