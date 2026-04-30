import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">{t('pages.notFound.title')}</h1>
        <p className="text-slate-400 mb-4">{t('pages.notFound.subtitle')}</p>
        <Link to="/" className="text-blue-400 hover:underline">
          {t('pages.notFound.goHome')}
        </Link>
      </div>
    </div>
  )
}
