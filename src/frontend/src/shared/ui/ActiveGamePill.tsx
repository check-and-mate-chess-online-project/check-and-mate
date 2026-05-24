import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActiveGame } from '../lib/useActiveGame'

export function ActiveGamePill() {
  const { t } = useTranslation()
  const { game } = useActiveGame()
  const location = useLocation()
  if (!game || game.result) return null
  if (location.pathname.startsWith(`/game/${game.id}`)) return null
  return (
    <Link
      to={`/game/${game.id}`}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-500/60 bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 text-sm transition-colors"
      title={t('pages.lobby.activeGame.cta')}
    >
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex w-full h-full rounded-full bg-orange-400 opacity-75" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-orange-400" />
      </span>
      <span className="hidden md:inline">
        {t('pages.lobby.activeGame.headerLabel')}
      </span>
    </Link>
  )
}
