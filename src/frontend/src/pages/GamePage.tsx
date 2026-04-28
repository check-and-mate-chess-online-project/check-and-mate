import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.game.title')}</h1>
      <p className="text-slate-400">
        {t('pages.game.idLabel')}: {gameId}
      </p>
    </div>
  )
}
