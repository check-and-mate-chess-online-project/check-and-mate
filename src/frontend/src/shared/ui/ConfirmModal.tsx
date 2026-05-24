import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface ConfirmModalProps {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel, onConfirm])

  const confirmClass = danger
    ? 'bg-orange-700 hover:bg-orange-600 text-white'
    : 'bg-violet-600 hover:bg-violet-500 text-white'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="bg-slate-900 border border-violet-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="text-xl mb-2 text-slate-100">{title}</h2>}
        <p className="text-slate-300 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={`px-4 py-2 text-sm rounded-md ${confirmClass}`}
          >
            {confirmLabel ?? t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
