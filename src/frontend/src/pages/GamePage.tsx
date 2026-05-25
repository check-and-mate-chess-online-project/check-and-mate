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
} from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'
import { useEquippedSkinsStore } from '../shared/lib/equippedSkins'
import { FightAnimation, type FightPiece } from '../shared/ui/FightAnimation'
import { ConfirmModal } from '../shared/ui/ConfirmModal'
import { MoveHistoryList } from '../shared/ui/MoveHistoryList'
import { CapturedPieces } from '../shared/ui/CapturedPieces'
import { playSound } from '../shared/lib/sound'
import {
  INITIAL_FEN,
  applyPlies,
  pairRounds,
  sortPlies as sortPliesShared,
} from '../shared/lib/chessReplay'

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

const sortPlies = sortPliesShared

function firstPlyMove(ply: PlyDto): MoveDto | undefined {
  return ply.move ?? ply.coordinates?.[0]
}

function squaresToApiMove(
  from: string,
  to: string,
  selectedFigure: FigureType | null = null,
): MakeMoveRequest {
  const f = squareToCoord(from)
  const t = squareToCoord(to)
  return {
    a: f.col,
    b: f.row,
    x: t.col,
    y: t.row,
    options: { selectedFigure },
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
        : 'text-slate-200'
  const reasonText =
    reason !== null
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
  const [appliedPlies, setAppliedPlies] = useState<
    ReturnType<typeof applyPlies>
  >([])
  const [cursor, setCursor] = useState(0)
  const [reviewing, setReviewing] = useState(false)
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
  const appliedPliesRef = useRef<ReturnType<typeof applyPlies>>([])
  const cursorRef = useRef(0)

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
  useEffect(() => {
    appliedPliesRef.current = appliedPlies
  }, [appliedPlies])
  useEffect(() => {
    cursorRef.current = cursor
  }, [cursor])

  const pushAppliedPly = useMemo(
    () => (ply: ReturnType<typeof applyPlies>[number]) => {
      const wasAtEnd = cursorRef.current === appliedPliesRef.current.length
      const next = [...appliedPliesRef.current, ply]
      appliedPliesRef.current = next
      setAppliedPlies(next)
      if (wasAtEnd) {
        cursorRef.current = next.length
        setCursor(next.length)
      }
    },
    [],
  )

  const popAppliedPly = useMemo(
    () => () => {
      const next = appliedPliesRef.current.slice(0, -1)
      appliedPliesRef.current = next
      setAppliedPlies(next)
      if (cursorRef.current > next.length) {
        cursorRef.current = next.length
        setCursor(next.length)
      }
    },
    [],
  )
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
      const sortedInitial = sortPlies(activeGame.moves ?? [])
      const initialApplied = applyPlies(sortedInitial)
      const appliedCount = initialApplied.length
      for (const ply of sortedInitial) {
        const move = firstPlyMove(ply)
        if (!move) continue
        const { from, to } = apiMoveToSquares(move)
        try {
          game.move({
            from,
            to,
            promotion: promotionFromMove(move) ?? 'q',
          })
        } catch {
          break
        }
      }
      setAppliedPlies(initialApplied)
      setCursor(appliedCount)
      setReviewing(false)
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
            pushAppliedPly({
              san: applied.san,
              fen: game.fen(),
              moveNumber: Math.ceil(game.history().length / 2),
              color: applied.color === 'w' ? 1 : 2,
              captured: applied.captured,
              mover: applied.color,
            })
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
            popAppliedPly()
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
        setEnded({ outcome: 'win', reason: GameTerminationReason.Disconnect })
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
  }, [activeGame, myColor, user?.id, t, game, switchTo, pause, syncClocksFromGame, pushAppliedPly, popAppliedPly])

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

  const totalPlies = appliedPlies.length
  const safeCursor = Math.min(cursor, totalPlies)
  const atLive = safeCursor === totalPlies
  const displayFen = atLive
    ? fen
    : safeCursor === 0
      ? INITIAL_FEN
      : appliedPlies[safeCursor - 1].fen
  const rounds = pairRounds(appliedPlies)
  const onCursor = (n: number) => {
    setCursor(n)
    setReviewing(n < totalPlies)
  }
  const goLive = () => {
    setCursor(totalPlies)
    setReviewing(false)
  }

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
    pushAppliedPly({
      san: applied.san,
      fen: game.fen(),
      moveNumber: Math.ceil(game.history().length / 2),
      color: applied.color === 'w' ? 1 : 2,
      captured: applied.captured,
      mover: applied.color,
    })
    const nextTurn = game.turn() === 'w' ? 'white' : 'black'
    setTurn(nextTurn)
    switchTo(nextTurn)
    pendingMoveRef.current = { from: sourceSquare, to: targetSquare }
    const selectedFigure = applied.flags.includes('p') ? FigureType.Queen : null
    const apiMove = squaresToApiMove(
      sourceSquare,
      targetSquare,
      selectedFigure,
    )
    gameHub.makeMove(apiMove).catch((err: unknown) => {
      const msg = err instanceof Error && err.message ? err.message : 'move failed'
      toast.error(msg)
      try {
        game.undo()
        setFen(game.fen())
        setTurn(game.turn() === 'w' ? 'white' : 'black')
        popAppliedPly()
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

      <main className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-[80rem] grid grid-cols-1 items-start gap-4 xl:grid-cols-[15rem_minmax(0,36rem)_15rem]">
          <aside className="flex flex-col gap-3 order-2 xl:order-1">
            <CapturedPieces
              applied={appliedPlies}
              upTo={safeCursor}
              myColor={myColor}
            />
            <MoveHistoryList
              applied={appliedPlies}
              rounds={rounds}
              cursor={safeCursor}
              totalPlies={totalPlies}
              onCursor={onCursor}
              className="max-h-[60vh] overflow-y-auto"
            />
            {reviewing && (
              <button
                type="button"
                onClick={goLive}
                className="px-3 py-2 rounded-md border border-orange-500/60 bg-orange-500/15 hover:bg-orange-500/25 text-orange-200 text-sm"
              >
                {t('pages.game.backToLive')} ▶
              </button>
            )}
          </aside>
          <div className="w-full max-w-xl justify-self-center flex flex-col gap-3 order-1 xl:order-2">
            <Clock
              ms={opponentColor === 'white' ? whiteMs : blackMs}
              active={active === opponentColor}
              login={opponentLogin}
            />
            <div className="relative">
              <Chessboard
                options={{
                  position: displayFen,
                  onPieceDrop: reviewing ? undefined : onPieceDrop,
                  onPieceDrag: reviewing ? undefined : onPieceDrag,
                  allowDragging: !reviewing,
                  boardOrientation: myColor,
                  squareStyles: reviewing ? {} : squareStyles,
                  boardStyle: {
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  },
                  darkSquareStyle: { backgroundColor: '#4c1d95' },
                  lightSquareStyle: { backgroundColor: '#e5e7eb' },
                }}
              />
              {reviewing && (
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-900/80 border border-slate-700 text-xs text-slate-300 tracking-wider uppercase pointer-events-none">
                  {t('pages.game.reviewing')} {safeCursor}/{totalPlies}
                </div>
              )}
            </div>
            <Clock
              ms={myColor === 'white' ? whiteMs : blackMs}
              active={active === myColor}
              login={user?.login ?? ''}
            />
          </div>
          <div className="hidden xl:block order-3" aria-hidden />
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
