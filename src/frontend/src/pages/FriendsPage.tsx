import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFriends } from '../shared/api/hooks'

type Tab = 'friends' | 'incoming' | 'outgoing' | 'invitations'

export function FriendsPage() {
  const { t } = useTranslation()
  const { data } = useFriends()
  const [tab, setTab] = useState<Tab>('friends')
  const [search, setSearch] = useState('')

  const tabs: Tab[] = ['friends', 'incoming', 'outgoing', 'invitations']

  const list =
    tab === 'friends'
      ? data?.friends
      : tab === 'incoming'
        ? data?.incomingRequests
        : tab === 'outgoing'
          ? data?.outgoingRequests
          : data?.gameInvitations
  const empty = !list || list.length === 0

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.friends.title')}</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('pages.friends.searchPlaceholder')}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-violet-500"
        />
        <button
          type="button"
          disabled={!search.trim()}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-md"
        >
          {t('pages.friends.addButton')}
        </button>
      </div>

      <div className="flex gap-1 border-b border-violet-900 mb-4">
        {tabs.map((to) => (
          <button
            key={to}
            type="button"
            onClick={() => setTab(to)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              tab === to
                ? 'border-violet-500 text-violet-100'
                : 'border-transparent text-violet-400 hover:text-violet-200'
            }`}
          >
            {t(`pages.friends.tabs.${to}`)}
          </button>
        ))}
      </div>

      {empty ? (
        <p className="text-slate-500 text-center py-12">
          {t('pages.friends.empty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {/* placeholder rendering */}
          <li className="text-slate-400 text-sm">{list?.length} items</li>
        </ul>
      )}
    </div>
  )
}
