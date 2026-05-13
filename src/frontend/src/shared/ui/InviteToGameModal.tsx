import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { Guid } from '../api'
import { ApiError } from '../api/http'
import { gameHub } from '../realtime/gameHub'

type TimeControlId = 'bullet' | 'blitz' | 'rapid'

interface TimeControlOption {
  id: TimeControlId
  initialSec: number
  incSec: number
}

const TIME_CONTROLS: TimeControlOption[] = [
  { id: 'bullet', initialSec: 120, incSec: 1 },
  { id: 'blitz', initialSec: 180, incSec: 2 },
  { id: 'rapid', initialSec: 900, incSec: 10 },
]

interface Props {
  target: { login?: string; id?: Guid }
  onClose: () => void
}

export function InviteToGameModal({ target, onClose }: Props) {
  const { t } = useTranslation()
  const [tc, setTc] = useState<TimeControlId>('blitz')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const config = TIME_CONTROLS.find((x) => x.id === tc)
    if (!config) return
    setSending(true)
    try {
      await gameHub.sendGameInvitation({
        receiverId: target.id,
        receiverLogin: target.login,
        timeControlIsEnabled: true,
        initialTimeSec: config.initialSec,
        incrementPerMoveSec: config.incSec,
      })
      onClose()
    } catch (e) {
      const msg = e instanceof ApiError && e.message ? e.message : (e as Error).message
      toast.error(msg || t('pages.friends.inviteFailed'))
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-violet-900 rounded-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl mb-1">{t('pages.friends.inviteTitle')}</h2>
        <p className="text-sm text-slate-400 mb-4 font-mono">
          {target.login ?? target.id?.slice(0, 8) ?? ''}
        </p>

        <div className="text-sm uppercase tracking-wider text-slate-500 mb-2">
          {t('pages.lobby.tc.title')}
        </div>
        <div className="flex gap-2 mb-6">
          {TIME_CONTROLS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setTc(c.id)}
              className={`flex-1 px-3 py-2 rounded-md border text-sm transition-colors ${
                tc === c.id
                  ? 'border-violet-500 bg-violet-500/10 text-slate-100'
                  : 'border-slate-800 hover:border-slate-600 text-slate-300'
              }`}
            >
              <div className="font-semibold">{t(`pages.lobby.tc.${c.id}`)}</div>
              <div className="text-xs text-slate-500">
                {c.initialSec / 60}+{c.incSec}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-slate-100"
          >
            {t('pages.friends.cancel')}
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={handleSend}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-md"
          >
            {t('pages.friends.sendInvite')}
          </button>
        </div>
      </div>
    </div>
  )
}
