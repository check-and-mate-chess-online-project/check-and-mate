import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { GameDto, Guid } from '../shared/api'
import { GameResult, GameTerminationReason } from '../shared/api/enums'
import { useAuth } from '../shared/auth/useAuth'
import { useGameHistory } from '../shared/api/hooks'

type Filter = 'all' | 'wins' | 'losses'

type Outcome = 'win' | 'loss' | 'draw'

const REASON_KEY: Record<GameTerminationReason, string> = {
  [GameTerminationReason.CheckMate]: 'checkmate',
  [GameTerminationReason.StaleMate]: 'stalemate',
  [GameTerminationReason.Resignation]: 'resignation',
  [GameTerminationReason.Timeout]: 'timeout',
  [GameTerminationReason.DrawAgreement]: 'drawAgreement',
  [GameTerminationReason.Disconnect]: 'disconnect',
}

function shortId(id: Guid): string {
  return id.slice(0, 8)
}

function gameOutcome(game: GameDto, userId: Guid): Outcome {
  if (game.result === GameResult.Draw) return 'draw'
  const userIsWhite = game.whitePlayerId === userId
  if (game.result === GameResult.WhiteVictory) return userIsWhite ? 'win' : 'loss'
  if (game.result === GameResult.BlackVictory) return userIsWhite ? 'loss' : 'win'
  return 'draw'
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeControl(game: GameDto): string {
  if (!game.timeControlIsEnabled) return '∞'
  const min = (game.initialTimeSec ?? 0) / 60
  return `${min}+${game.incrementPerMoveSec ?? 0}`
}

export function HistoryPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: games, isLoading } = useGameHistory()
  const [filter, setFilter] = useState<Filter>('all')

  const sortedGames = useMemo(() => {
    if (!games) return []
    return [...games].sort((a, b) => {
      const aTime = a.startTimeUtc ? new Date(a.startTimeUtc).getTime() : 0
      const bTime = b.startTimeUtc ? new Date(b.startTimeUtc).getTime() : 0
      return bTime - aTime
    })
  }, [games])

  const filtered = useMemo(() => {
    if (!user) return []
    return sortedGames.filter((g) => {
      const outcome = gameOutcome(g, user.id)
      if (filter === 'wins') return outcome === 'win'
      if (filter === 'losses') return outcome === 'loss'
      return true
    })
  }, [sortedGames, filter, user])

  const filters: Filter[] = ['all', 'wins', 'losses']
  const empty = !isLoading && filtered.length === 0

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.history.title')}</h1>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-sm ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t(`pages.history.filters.${f}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-center py-12">...</p>
      ) : empty ? (
        <p className="text-slate-500 text-center py-12">
          {t('pages.history.empty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((g) => {
            if (!user) return null
            const outcome = gameOutcome(g, user.id)
            const opponentId =
              g.whitePlayerId === user.id ? g.blackPlayerId : g.whitePlayerId
            const myColor = g.whitePlayerId === user.id ? 'white' : 'black'
            const reasonText = g.terminationReason !== null
              ? t(`pages.game.reason.${REASON_KEY[g.terminationReason]}`)
              : ''
            const outcomeColor =
              outcome === 'win'
                ? 'text-orange-400'
                : outcome === 'loss'
                  ? 'text-violet-300'
                  : 'text-slate-300'
            return (
              <li key={g.id}>
                <Link
                  to={`/history/${g.id}`}
                  className="flex items-center justify-between gap-4 bg-slate-900/60 border border-violet-900 rounded-md p-4 hover:bg-slate-900 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className={`text-lg font-semibold ${outcomeColor}`}>
                      {t(`pages.game.result.${outcome}`)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {reasonText}
                    </span>
                  </div>
                  <div className="flex-1 text-sm text-slate-300">
                    <span className="text-slate-500">{t('pages.history.enemy')} </span>
                    <span className="font-mono">{shortId(opponentId)}</span>
                    <span className="text-slate-500"> · {myColor}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-sm text-slate-300">
                      {formatTimeControl(g)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(g.startTimeUtc)}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
