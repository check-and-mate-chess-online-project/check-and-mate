import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGameHistory } from '../shared/api/hooks'

type Filter = 'all' | 'wins' | 'losses'

export function HistoryPage() {
  const { t } = useTranslation()
  const { data: games } = useGameHistory()
  const [filter, setFilter] = useState<Filter>('all')

  const filters: Filter[] = ['all', 'wins', 'losses']
  const empty = !games || games.length === 0

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.history.title')}</h1>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded-full text-sm ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t(`pages.history.filters.${f}`)}
          </button>
        ))}
      </div>

      {empty ? (
        <p className="text-slate-500 text-center py-12">
          {t('pages.history.empty')}
        </p>
      ) : (
        <ul className="space-y-2">
          {games.map((g) => (
            <li
              key={g.id}
              className="bg-slate-900/60 border border-violet-900 rounded-md p-4"
            >
              {g.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
