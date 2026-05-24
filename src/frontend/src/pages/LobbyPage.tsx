import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAuth } from '../shared/auth/useAuth'
import { TypedText } from '../shared/ui/TypedText'
import { gameHub, subscribeGameHub } from '../shared/realtime/gameHub'
import { useActiveGame } from '../shared/lib/useActiveGame'

type Mode = 'rated' | 'casual' | 'story'
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

const MODE_ICONS: Record<Mode, string> = {
  rated: '★',
  casual: '◐',
  story: '✦',
}

const TC_ICONS: Record<TimeControlId, string> = {
  bullet: '⚡',
  blitz: '⚔',
  rapid: '◷',
}

interface ChoiceProps {
  label: string
  hint?: string
  icon?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}

function Choice({ label, hint, icon, active, disabled, onClick }: ChoiceProps) {
  const base =
    'group flex-1 px-5 py-7 rounded-xl border text-center transition-all relative overflow-hidden'
  const stateClass = disabled
    ? 'border-slate-800/60 bg-slate-900/30 text-slate-600 cursor-not-allowed'
    : active
      ? 'border-violet-400 bg-violet-500/15 text-slate-100 shadow-[0_0_24px_rgba(167,139,250,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]'
      : 'border-slate-800 bg-slate-900/40 hover:border-violet-700 hover:bg-violet-500/5 text-slate-300'
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`${base} ${stateClass}`}
    >
      {icon && (
        <div
          className={
            active
              ? 'text-3xl mb-2 text-violet-300'
              : disabled
                ? 'text-3xl mb-2 text-slate-700'
                : 'text-3xl mb-2 text-slate-500 group-hover:text-violet-400'
          }
        >
          {icon}
        </div>
      )}
      <div className="text-lg font-semibold">{label}</div>
      {hint && (
        <div
          className={
            disabled
              ? 'text-xs text-slate-700 mt-1'
              : 'text-xs text-slate-500 mt-1'
          }
        >
          {hint}
        </div>
      )}
    </motion.button>
  )
}

export function LobbyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { game: activeGame } = useActiveGame()
  const [mode, setMode] = useState<Mode | null>(null)
  const [tc, setTc] = useState<TimeControlId | null>(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    return subscribeGameHub({
      onSearchStopped: () => {
        setSearching(false)
      },
      onGameStarted: (game) => {
        qc.setQueryData(['game', game.id], game)
        setSearching(false)
        navigate(`/game/${game.id}`)
      },
    })
  }, [navigate, qc])

  const handlePlay = async () => {
    const tcConfig = TIME_CONTROLS.find((x) => x.id === tc)
    if (!mode || !tcConfig) return
    setSearching(true)
    try {
      await gameHub.findGame({
        timeControlIsEnabled: true,
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
  const showActive = activeGame && !activeGame.result

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl mb-10">
        <TypedText
          text={t(`pages.lobby.greeting.${getGreetingKey()}`, {
            name: user?.login ?? '...',
          })}
        />
      </h1>

      {showActive && (
        <motion.button
          type="button"
          onClick={() => navigate(`/game/${activeGame.id}`)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full mb-8 px-5 py-4 rounded-xl border border-orange-500/60 bg-gradient-to-r from-orange-600/15 to-orange-500/5 hover:from-orange-500/25 hover:to-orange-500/10 text-left flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl text-orange-300">⏵</span>
            <div>
              <div className="text-orange-200 font-semibold">
                {t('pages.lobby.activeGame.title')}
              </div>
              <div className="text-xs text-orange-300/70 mt-0.5">
                {t('pages.lobby.activeGame.subtitle')}
              </div>
            </div>
          </div>
          <span className="text-orange-200 text-sm uppercase tracking-wider">
            {t('pages.lobby.activeGame.cta')} →
          </span>
        </motion.button>
      )}

      <section className="mb-8">
        <div className="text-sm uppercase tracking-wider text-slate-500 mb-3">
          {t('pages.lobby.mode.title')}
        </div>
        <div className="flex gap-3">
          <Choice
            label={t('pages.lobby.mode.rated')}
            icon={MODE_ICONS.rated}
            active={mode === 'rated'}
            onClick={() => setMode('rated')}
          />
          <Choice
            label={t('pages.lobby.mode.casual')}
            icon={MODE_ICONS.casual}
            hint={t('pages.lobby.mode.soon')}
            disabled
          />
          <Choice
            label={t('pages.lobby.mode.story')}
            icon={MODE_ICONS.story}
            hint={t('pages.lobby.mode.soon')}
            disabled
          />
        </div>
      </section>

      {mode && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
          <div className="text-sm uppercase tracking-wider text-slate-500 mb-3">
            {t('pages.lobby.tc.title')}
          </div>
          <div className="flex gap-3">
            {TIME_CONTROLS.map((c) => (
              <Choice
                key={c.id}
                label={t(`pages.lobby.tc.${c.id}`)}
                icon={TC_ICONS[c.id]}
                hint={`${c.initialSec / 60}+${c.incSec}`}
                active={tc === c.id}
                onClick={() => setTc(c.id)}
              />
            ))}
          </div>
        </motion.section>
      )}

      {ready && (
        <motion.button
          type="button"
          onClick={handlePlay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600 text-white font-semibold text-lg rounded-xl shadow-[0_4px_24px_rgba(167,139,250,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
        >
          {t('pages.lobby.play')}
        </motion.button>
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
