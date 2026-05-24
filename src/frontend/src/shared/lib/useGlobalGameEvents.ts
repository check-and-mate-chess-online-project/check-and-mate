import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { gameHub, subscribeGameHub } from '../realtime/gameHub'
import { useAuth } from '../auth/useAuth'
import { playSound } from './sound'

export function useGlobalGameEvents() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    return subscribeGameHub({
      onGameStarted: (game) => {
        qc.setQueryData(['game', game.id], game)
        playSound('gameStart')
        navigate(`/game/${game.id}`)
      },
      onGameInvitationReceived: (invitation) => {
        playSound('notify')
        const sender = invitation.sender.login
        const tc = invitation.timeControlIsEnabled
          ? `${(invitation.initialTimeSec ?? 0) / 60}+${invitation.incrementPerMoveSec ?? 0}`
          : t('invitations.untimed')
        toast.info(t('invitations.received', { sender, tc }), {
          duration: Infinity,
          action: {
            label: t('invitations.accept'),
            onClick: () => {
              gameHub.acceptGameInvitation(invitation.id).catch(() => {
                toast.error(t('invitations.acceptFailed'))
              })
            },
          },
          cancel: {
            label: t('invitations.reject'),
            onClick: () => {
              gameHub.rejectGameInvitation(invitation.id).catch(() => {})
            },
          },
        })
        qc.invalidateQueries({ queryKey: ['game-invitations'] })
      },
      onGameInvitationAccepted: () => {
        qc.invalidateQueries({ queryKey: ['game-invitations'] })
      },
      onGameInvitationRejected: () => {
        toast.warning(t('invitations.rejected'))
        qc.invalidateQueries({ queryKey: ['game-invitations'] })
      },
      onGameInvitationSent: () => {
        toast.success(t('invitations.sent'))
        qc.invalidateQueries({ queryKey: ['game-invitations'] })
      },
    })
  }, [isAuthenticated, navigate, qc, t])
}
