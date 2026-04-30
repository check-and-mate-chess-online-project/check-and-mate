import { Component, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

function ErrorFallback() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen text-slate-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-2">
          {t('errors.boundary.title')}
        </h1>
        <p className="text-slate-400 mb-6">{t('errors.boundary.subtitle')}</p>
        <button
          type="button"
          onClick={() => location.reload()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-medium"
        >
          {t('errors.boundary.reload')}
        </button>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(
    error: Error,
    info: { componentStack?: string | null },
  ): void {
    console.error('ErrorBoundary caught', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
