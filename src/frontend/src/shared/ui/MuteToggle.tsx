import { useTranslation } from 'react-i18next'
import { useSoundStore, playSound } from '../lib/sound'

export function MuteToggle() {
  const { t } = useTranslation()
  const muted = useSoundStore((s) => s.muted)
  const toggle = useSoundStore((s) => s.toggleMute)

  const handleClick = () => {
    const wasMuted = muted
    toggle()
    if (wasMuted) playSound('click')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={muted ? t('sound.unmute') : t('sound.mute')}
      title={muted ? t('sound.unmute') : t('sound.mute')}
      className={
        muted
          ? 'w-9 h-9 flex items-center justify-center rounded-md border border-slate-800 bg-slate-900/40 text-slate-500 hover:text-slate-300 hover:border-slate-700 transition-colors'
          : 'w-9 h-9 flex items-center justify-center rounded-md border border-violet-900 bg-violet-950/40 text-violet-300 hover:text-violet-100 hover:border-violet-700 transition-colors'
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M11 5L6 9H3v6h3l5 4V5z" />
        {muted ? (
          <>
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        ) : (
          <>
            <path d="M16 8a5 5 0 010 8" />
            <path d="M19 5a9 9 0 010 14" />
          </>
        )}
      </svg>
    </button>
  )
}
