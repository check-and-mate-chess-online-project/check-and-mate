import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '../shared/api/hooks'

export function UserProfilePage() {
  const { login } = useParams<{ login: string }>()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useUserProfile(login ?? '')

  if (isLoading) {
    return <p className="text-slate-500">...</p>
  }
  if (isError || !data) {
    return <p className="text-slate-500">{t('pages.userProfile.notFound')}</p>
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl mb-2">{data.login}</h1>
      <p className="text-sm text-slate-500 mb-6">
        {t('pages.userProfile.label')}
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <dt className="text-slate-500">{t('pages.userProfile.rating')}</dt>
        <dd className="text-slate-200">{data.rating}</dd>
        <dt className="text-slate-500">{t('pages.userProfile.balance')}</dt>
        <dd className="text-slate-200">{data.balance}</dd>
        <dt className="text-slate-500">{t('pages.userProfile.lootboxes')}</dt>
        <dd className="text-slate-200">{data.lootBoxCount}</dd>
      </dl>
    </div>
  )
}
