import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, api } from '../shared/api/http'
import type { UserDto } from '../shared/api'
import { setToken } from '../shared/auth/token'
import { useAuthStore } from '../shared/auth/authStore'

const schema = z
  .object({
    login: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: 'passwordsDontMatch',
  })
type FormValues = z.infer<typeof schema>

const inputClass =
  'bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-violet-500'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', email: '', password: '', confirm: '' },
  })

  const onSubmit = async ({ login, email, password }: FormValues) => {
    try {
      const { token } = await api.post<{ token: string }>(
        '/api/auth/register',
        { login, email, password },
      )
      setToken(token)
      const user = await api.get<UserDto>('/api/users/me')
      useAuthStore.getState().setSession(token, user)
      navigate('/lobby')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('root', { message: t('forms.register.loginTaken') })
      } else {
        setError('root', { message: t('forms.register.networkError') })
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm flex flex-col gap-4"
    >
      <h1 className="text-3xl font-bold text-center mb-2">
        {t('pages.register.title')}
      </h1>
      <input
        type="text"
        placeholder={t('forms.register.loginPlaceholder')}
        autoComplete="username"
        className={inputClass}
        {...register('login')}
      />
      <input
        type="email"
        placeholder={t('forms.register.emailPlaceholder')}
        autoComplete="email"
        className={inputClass}
        {...register('email')}
      />
      <input
        type="password"
        placeholder={t('forms.register.passwordPlaceholder')}
        autoComplete="new-password"
        className={inputClass}
        {...register('password')}
      />
      <input
        type="password"
        placeholder={t('forms.register.confirmPlaceholder')}
        autoComplete="new-password"
        className={inputClass}
        {...register('confirm')}
      />
      {errors.confirm?.message === 'passwordsDontMatch' && (
        <p className="text-red-400 text-sm">
          {t('forms.register.passwordsDontMatch')}
        </p>
      )}
      {errors.root && (
        <p className="text-red-400 text-sm">{errors.root.message}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium"
      >
        {isSubmitting
          ? t('forms.register.submitting')
          : t('forms.register.submit')}
      </button>
      <p className="text-center text-sm text-slate-400">
        <Link to="/login" className="hover:text-slate-100 underline">
          {t('landing.signIn')}
        </Link>
      </p>
    </form>
  )
}
