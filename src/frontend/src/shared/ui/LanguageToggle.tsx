import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const current = i18n.resolvedLanguage?.startsWith('ru') ? 'ru' : 'en'

  const buttonClass = (lang: 'en' | 'ru') =>
    `text-xs uppercase ${
      current === lang
        ? 'text-slate-100 font-semibold'
        : 'text-slate-500 hover:text-slate-300'
    }`

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        className={buttonClass('en')}
      >
        EN
      </button>
      <span className="text-xs text-slate-600">|</span>
      <button
        type="button"
        onClick={() => i18n.changeLanguage('ru')}
        className={buttonClass('ru')}
      >
        RU
      </button>
    </div>
  )
}
