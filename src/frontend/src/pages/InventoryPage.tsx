import { useTranslation } from 'react-i18next'

export function InventoryPage() {
  const { t } = useTranslation()
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('pages.inventory.title')}</h1>
      <p className="text-slate-400">{t('pages.inventory.placeholder')}</p>
    </div>
  )
}
