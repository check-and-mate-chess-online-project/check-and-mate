import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ApiError, api } from '../shared/api/http'
import type { AuthResultDto } from '../shared/api'
import { useAuthStore } from '../shared/auth/authStore'

const inputClass =
  'bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-violet-500'

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const schema = useMemo(
    () =>
      z
        .object({
          login: z.string().min(3, t('forms.register.errors.loginShort')),
          email: z.string().email(t('forms.register.errors.emailInvalid')),
          password: z.string().min(8, t('forms.register.errors.passwordShort')),
          confirm: z.string(),
        })
        .refine((d) => d.password === d.confirm, {
          path: ['confirm'],
          message: t('forms.register.passwordsDontMatch'),
        }),
    [t],
  )
  type FormValues = z.infer<typeof schema>

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
      const { user, token } = await api.post<AuthResultDto>(
        '/api/auth/register',
        { login, email, password },
      )
      useAuthStore.getState().setSession(token, user, true)
      navigate('/onboarding')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('root', { message: t('forms.register.loginTaken') })
      } else {
        setError('root', { message: t('forms.register.networkError') })
      }
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm flex flex-col gap-2"
    >
      <h1 className="text-3xl font-bold text-center mb-4">
        {t('pages.register.title')}
      </h1>

      <input
        type="text"
        placeholder={t('forms.register.loginPlaceholder')}
        autoComplete="username"
        className={inputClass}
        {...register('login')}
      />
      {errors.login && (
        <p className="text-red-400 text-sm -mt-1">{errors.login.message}</p>
      )}

      <input
        type="email"
        placeholder={t('forms.register.emailPlaceholder')}
        autoComplete="email"
        className={inputClass}
        {...register('email')}
      />
      {errors.email && (
        <p className="text-red-400 text-sm -mt-1">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder={t('forms.register.passwordPlaceholder')}
        autoComplete="new-password"
        className={inputClass}
        {...register('password')}
      />
      {errors.password && (
        <p className="text-red-400 text-sm -mt-1">{errors.password.message}</p>
      )}

      <input
        type="password"
        placeholder={t('forms.register.confirmPlaceholder')}
        autoComplete="new-password"
        className={inputClass}
        {...register('confirm')}
      />
      {errors.confirm && (
        <p className="text-red-400 text-sm -mt-1">{errors.confirm.message}</p>
      )}

      {errors.root && (
        <p className="text-red-400 text-sm mt-2">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium mt-3"
      >
        {isSubmitting
          ? t('forms.register.submitting')
          : t('forms.register.submit')}
      </button>

      <p className="text-center text-sm text-slate-400 mt-2">
        <Link to="/login" className="hover:text-slate-100 underline">
          {t('landing.signIn')}
        </Link>
      </p>
    </form>
    </div>
  )
}
