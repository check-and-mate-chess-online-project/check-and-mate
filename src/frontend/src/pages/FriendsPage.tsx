import { useTranslation } from 'react-i18next'

export function FriendsPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.friends.title')}</h1>
      <p className="text-slate-400">{t('pages.friends.placeholder')}</p>
    </div>
  )
}
