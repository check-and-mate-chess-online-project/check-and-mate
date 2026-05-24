import { useTranslation } from 'react-i18next'

export function MyProfilePage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.myProfile.title')}</h1>
      <p className="text-slate-400">{t('pages.myProfile.placeholder')}</p>
    </div>
  )
}
