import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '../shared/auth/useAuth'
import { TypedText } from '../shared/ui/TypedText'

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
      ? 'border-blue-500 bg-blue-500/10 text-slate-100'
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
  const [mode, setMode] = useState<Mode | null>(null)
  const [tc, setTc] = useState<TimeControlId | null>(null)

  const handlePlay = () => {
    toast.info(t('pages.lobby.soonToast'))
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
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg rounded-lg"
        >
          {t('pages.lobby.play')}
        </button>
      )}
    </div>
  )
}
