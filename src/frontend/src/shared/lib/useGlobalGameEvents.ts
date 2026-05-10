import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { gameHub, subscribeGameHub } from '../realtime/gameHub'
import { useAuth } from '../auth/useAuth'

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
        navigate(`/game/${game.id}`)
      },
      onGameInvitationReceived: (invitation) => {
        toast.info(t('invitations.received'), {
          duration: 15000,
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
