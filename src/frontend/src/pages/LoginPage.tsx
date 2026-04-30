import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, api } from '../shared/api/http'
import type { UserDto } from '../shared/api'
import { setToken } from '../shared/auth/token'
import { useAuthStore } from '../shared/auth/authStore'

const inputClass =
  'bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await api.post<{ token: string }>('/api/auth/login', {
        login,
        password,
      })
      setToken(token)
      const user = await api.get<UserDto>('/api/users/me')
      useAuthStore.getState().setSession(token, user)
      navigate('/lobby')
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.status === 400)
      ) {
        setError(t('forms.login.invalidCredentials'))
      } else {
        setError(t('forms.login.networkError'))
      }
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <h1 className="text-3xl font-bold text-center mb-2">
        {t('pages.login.title')}
      </h1>
      <input
        type="text"
        value={login}
        onChange={(e) => setLogin(e.target.value)}
        placeholder={t('forms.login.loginPlaceholder')}
        autoComplete="username"
        required
        className={inputClass}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('forms.login.passwordPlaceholder')}
        autoComplete="current-password"
        required
        className={inputClass}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium"
      >
        {loading ? t('forms.login.submitting') : t('forms.login.submit')}
      </button>
      <p className="text-center text-sm text-slate-400">
        <Link to="/register" className="hover:text-slate-100 underline">
          {t('landing.signUp')}
        </Link>
      </p>
    </form>
  )
}
