import { useTranslation } from 'react-i18next'

export function ShopPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.shop.title')}</h1>
      <p className="text-slate-400">{t('pages.shop.placeholder')}</p>
    </div>
  )
}
