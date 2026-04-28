import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.login.title')}</h1>
      <p className="text-slate-400">{t('pages.login.placeholder')}</p>
    </div>
  )
}
