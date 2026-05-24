import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.svg'

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="text-center max-w-2xl">
      <h1 className="mb-6">
        <img
          src={logo}
          alt="Check &amp; Mate"
          className="w-full max-w-xl mx-auto"
        />
      </h1>
      <p className="text-xl text-slate-400 mb-8">{t('landing.tagline')}</p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-violet-700 hover:bg-violet-600 rounded-md font-medium"
        >
          {t('landing.signIn')}
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-orange-700 hover:bg-orange-600 rounded-md font-medium"
        >
          {t('landing.signUp')}
        </Link>
      </div>
    </div>
  )
}
