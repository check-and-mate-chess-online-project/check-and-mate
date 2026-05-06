import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../shared/auth/useAuth'
import { TypedText } from '../shared/ui/TypedText'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'

type Mode = 'casual' | 'rated'
type TimeControlId = 'bullet' | 'blitz' | 'rapid'

interface TimeControl {
  id: TimeControlId
  initialSec: number
  incSec: number
}

function getGreetingKey(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

const TIME_CONTROLS: TimeControl[] = [
  { id: 'bullet', initialSec: 120, incSec: 1 },
  { id: 'blitz', initialSec: 180, incSec: 2 },
  { id: 'rapid', initialSec: 900, incSec: 10 },
]

interface ChoiceProps {
  label: string
  hint?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

function Choice({ label, hint, active, disabled, onClick }: ChoiceProps) {
  const base =
    'flex-1 px-4 py-6 rounded-lg border text-center transition-colors'
  const stateClass = disabled
    ? 'border-slate-800 text-slate-600 cursor-not-allowed'
    : active
      ? 'border-violet-500 bg-violet-500/10 text-slate-100'
      : 'border-slate-800 hover:border-slate-600 text-slate-300'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${stateClass}`}
    >
      <div className="text-lg font-semibold">{label}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </button>
  )
}

export function LobbyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [mode, setMode] = useState<Mode | null>(null)
  const [tc, setTc] = useState<TimeControlId | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!searching) return
    return subscribeGameHub({
      onSearchStarted: () => {
        // backend подтвердил постановку в pool
      },
      onSearchStopped: () => {
        setSearching(false)
      },
      onGameStarted: (game) => {
        qc.setQueryData(['game', game.id], game)
        setSearching(false)
        navigate(`/game/${game.id}`)
      },
    })
  }, [searching, navigate, qc])

  const handlePlay = async () => {
    const tcConfig = TIME_CONTROLS.find((x) => x.id === tc)
    if (!mode || !tcConfig) return
    setSearching(true)
    try {
      await gameHub.findGame({
        isEnabled: true,
        initialTimeSec: tcConfig.initialSec,
        incrementPerMoveSec: tcConfig.incSec,
      })
    } catch {
      toast.error(t('pages.lobby.searchFailed'))
      setSearching(false)
    }
  }

  const handleCancel = async () => {
    try {
      await gameHub.cancelSearch()
    } catch {
      // ignore
    }
    setSearching(false)
  }

  const ready = mode !== null && tc !== null

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl mb-10">
        <TypedText
          text={t(`pages.lobby.greeting.${getGreetingKey()}`, {
            name: user?.login ?? '...',
          })}
        />
      </h1>

      <section className="mb-8">
        <div className="text-sm uppercase tracking-wider text-slate-500 mb-3">
          {t('pages.lobby.mode.title')}
        </div>
        <div className="flex gap-3">
          <Choice
            label={t('pages.lobby.mode.casual')}
            active={mode === 'casual'}
            onClick={() => setMode('casual')}
          />
          <Choice
            label={t('pages.lobby.mode.rated')}
            active={mode === 'rated'}
            onClick={() => setMode('rated')}
          />
          <Choice
            label={t('pages.lobby.mode.story')}
            hint={t('pages.lobby.mode.soon')}
            disabled
          />
        </div>
      </section>

      {mode && (
        <section className="mb-8">
          <div className="text-sm uppercase tracking-wider text-slate-500 mb-3">
            {t('pages.lobby.tc.title')}
          </div>
          <div className="flex gap-3">
            {TIME_CONTROLS.map((c) => (
              <Choice
                key={c.id}
                label={t(`pages.lobby.tc.${c.id}`)}
                hint={`${c.initialSec / 60}+${c.incSec}`}
                active={tc === c.id}
                onClick={() => setTc(c.id)}
              />
            ))}
          </div>
        </section>
      )}

      {ready && (
        <button
          type="button"
          onClick={handlePlay}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg rounded-lg"
        >
          {t('pages.lobby.play')}
        </button>
      )}

      {searching && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 border border-violet-900 rounded-lg p-8 text-center max-w-sm">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-slate-100 mb-6">{t('pages.lobby.searching')}</div>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md"
            >
              {t('pages.lobby.cancelSearch')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
