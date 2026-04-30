import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        {t('pages.userProfile.title')}
      </h1>
      <p className="text-slate-400">
        {t('pages.userProfile.label')}: {userId}
      </p>
    </div>
  )
}
