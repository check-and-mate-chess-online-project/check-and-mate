import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '../shared/auth/useAuth'

interface StatProps {
  label: string
  value: string | number
}

function StatCard({ label, value }: StatProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-6 py-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  )
}

export function LobbyPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const handlePlay = () => {
    toast.info(t('pages.lobby.soon'))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl mb-8">
        {t('pages.lobby.welcome', { name: user?.login ?? '...' })}
      </h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label={t('pages.lobby.rating')} value={user?.rating ?? 0} />
        <StatCard label={t('pages.lobby.balance')} value={user?.balance ?? 0} />
        <StatCard
          label={t('pages.lobby.cases')}
          value={user?.lootBoxCount ?? 0}
        />
      </div>

      <button
        type="button"
        onClick={handlePlay}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg rounded-lg"
      >
        {t('pages.lobby.play')}
      </button>
    </div>
  )
}
