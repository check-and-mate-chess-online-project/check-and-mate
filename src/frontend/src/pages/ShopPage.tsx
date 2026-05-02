import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBuyLootbox, useMe } from '../shared/api/hooks'

const PRICE_PER_CASE = 100

export function ShopPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const buy = useBuyLootbox()
  const [count, setCount] = useState(1)

  const total = count * PRICE_PER_CASE
  const balance = me?.balance ?? 0
  const notEnough = balance < total

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.shop.title')}</h1>

      <div className="bg-slate-900/60 border border-violet-900 rounded-lg p-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-32 h-32 bg-violet-900/30 border-2 border-violet-500 rounded-lg flex items-center justify-center text-5xl">
            📦
          </div>
          <div>
            <div className="text-xl mb-1">{t('pages.shop.caseTitle')}</div>
            <div className="text-sm text-slate-400">
              {t('pages.shop.caseDescription')}
            </div>
            <div className="text-yellow-400 mt-2">{PRICE_PER_CASE} ◈</div>
          </div>
        </div>

        <label className="block text-sm text-slate-400 mb-2">
          {t('pages.shop.amount')}: {count}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-violet-500 mb-4"
        />

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400">{t('pages.shop.total')}</span>
          <span className="text-yellow-400 text-lg tabular-nums">
            {total} ◈
          </span>
        </div>

        {notEnough && (
          <p className="text-red-400 text-sm mb-3">
            {t('pages.shop.notEnoughBalance')}
          </p>
        )}

        <button
          type="button"
          disabled={buy.isPending || notEnough}
          onClick={() => buy.mutate(count)}
          className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-md font-medium"
        >
          {t('pages.shop.buyButton')}
        </button>
      </div>
    </div>
  )
}
