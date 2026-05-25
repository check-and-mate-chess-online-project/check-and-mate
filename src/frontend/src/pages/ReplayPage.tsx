import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  GameResult,
  GameTerminationReason,
  normalizeGameResult,
  normalizeGameTerminationReason,
} from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { useGameHistory } from '../shared/api/hooks'
import { Chessboard } from '../shared/ui/Chessboard/Chessboard'
import { MoveHistoryList } from '../shared/ui/MoveHistoryList'
import { CapturedPieces } from '../shared/ui/CapturedPieces'
import {
  INITIAL_FEN,
  applyPlies,
  pairRounds,
  sortPlies,
} from '../shared/lib/chessReplay'

const REASON_KEY: Record<number, string> = {
  [GameTerminationReason.CheckMate]: 'checkmate',
  [GameTerminationReason.StaleMate]: 'stalemate',
  [GameTerminationReason.Resignation]: 'resignation',
  [GameTerminationReason.Timeout]: 'timeout',
  [GameTerminationReason.DrawAgreement]: 'drawAgreement',
  [GameTerminationReason.Disconnect]: 'disconnect',
}

function sideColor(result: GameResult | null, side: 'white' | 'black'): string {
  const normalizedResult = normalizeGameResult(result)
  if (normalizedResult === null || normalizedResult === GameResult.Draw) {
    return 'text-slate-200'
  }
  const wonByWhite = normalizedResult === GameResult.WhiteVictory
  const won = (side === 'white') === wonByWhite
  return won ? 'text-orange-400' : 'text-violet-300'
}

export function ReplayPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: games, isLoading } = useGameHistory()
  const game = games?.find((g) => g.id === gameId)

  const sortedPlies = useMemo(
    () => (game?.moves ? sortPlies(game.moves) : []),
    [game],
  )

  const applied = useMemo(() => applyPlies(sortedPlies), [sortedPlies])
  const rounds = useMemo(() => pairRounds(applied), [applied])
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

  const myColor = game.whitePlayer.id === user.id ? 'white' : 'black'
  const opponent =
    game.whitePlayer.id === user.id ? game.blackPlayer : game.whitePlayer
  const result = normalizeGameResult(game.result)
  const outcome =
    result === GameResult.Draw
      ? 'draw'
      : (result === GameResult.WhiteVictory) === (myColor === 'white')
        ? 'win'
        : 'loss'
  const reason = normalizeGameTerminationReason(game.terminationReason)
  const reasonText =
    reason !== null ? t(`pages.game.reason.${REASON_KEY[reason]}`) : ''

  return (
    <div className="w-full max-w-[84rem] mx-auto px-4">
      <Link
        to="/history"
        className="inline-block text-slate-400 hover:text-slate-100 text-sm mb-3"
      >
        ← {t('nav.profileItems.history')}
      </Link>

      <div className="text-center mb-4">
        <h2
          className={`text-2xl ${
            outcome === 'win'
              ? 'text-orange-400'
              : outcome === 'loss'
                ? 'text-violet-300'
                : 'text-slate-200'
          }`}
        >
          {t(`pages.game.result.${outcome}`)}
        </h2>
        <p className="text-sm text-slate-400">
          {reasonText}
          <span className="text-slate-600"> · {t('pages.replay.enemy')} </span>
          <span className="text-slate-200">{opponent.login}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 items-start justify-center gap-4 xl:grid-cols-[16rem_minmax(0,36rem)_16rem] xl:gap-6 2xl:grid-cols-[18rem_minmax(0,36rem)_18rem]">
        <CapturedPieces applied={applied} upTo={safeCursor} myColor={myColor} />
        <div className="w-full max-w-xl justify-self-center">
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

        <MoveHistoryList
          applied={applied}
          rounds={rounds}
          cursor={safeCursor}
          totalPlies={totalPlies}
          onCursor={setCursor}
          whiteLogin={game.whitePlayer.login}
          blackLogin={game.blackPlayer.login}
          whiteClass={sideColor(game.result, 'white')}
          blackClass={sideColor(game.result, 'black')}
          className="w-full max-w-2xl justify-self-center max-h-[80vh] overflow-y-auto xl:max-w-none xl:justify-self-stretch"
        />
      </div>
    </div>
  )
}
