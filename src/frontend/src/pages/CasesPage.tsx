import { useTranslation } from 'react-i18next'
import { useMe, useOpenLootbox } from '../shared/api/hooks'

export function CasesPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const open = useOpenLootbox()

  const count = me?.lootBoxCount ?? 0
  const empty = count === 0

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.cases.title')}</h1>

      <div className="bg-slate-900/60 border border-violet-900 rounded-lg p-6 flex items-center gap-6">
        <div className="w-32 h-32 bg-violet-900/30 border-2 border-violet-500 rounded-lg flex items-center justify-center text-5xl">
          📦
        </div>
        <div className="flex-1">
          <div className="text-slate-300 mb-3">
            {t('pages.cases.youHave', { count })}
          </div>
          {empty ? (
            <p className="text-sm text-slate-500">{t('pages.cases.noCases')}</p>
          ) : (
            <button
              type="button"
              disabled={open.isPending}
              onClick={() => open.mutate()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-md font-medium"
            >
              {t('pages.cases.openButton')}
            </button>
          )}
        </div>
      </div>

      {open.data && (
        <div className="mt-4 p-4 bg-slate-900/60 border border-violet-900 rounded-lg">
          {open.data.isDuplicate
            ? t('pages.cases.duplicate')
            : t('pages.cases.dropped', { id: open.data.skinId })}
        </div>
      )}
    </div>
  )
}
