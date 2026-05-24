import { useEffect, useState } from 'react'
import { gameHub, subscribeGameHub } from '../realtime/gameHub'
import type { GameDto } from '../api'
import { useAuth } from '../auth/useAuth'

export function useActiveGame() {
  const { isAuthenticated } = useAuth()
  const [game, setGame] = useState<GameDto | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    gameHub
      .getActiveGameState()
      .then((g) => {
        if (cancelled) return
        setGame(g ?? null)
      })
      .catch(() => {
        if (!cancelled) setGame(null)
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    return subscribeGameHub({
      onGameStarted: (g) => setGame(g),
      onPlayerResigned: (g) => {
        if (g.result) setGame(null)
        else setGame(g)
      },
      onPlayerLeft: (g) => {
        if (g.result) setGame(null)
        else setGame(g)
      },
      onTimeExpired: (g) => {
        if (g.result) setGame(null)
        else setGame(g)
      },
    })
  }, [isAuthenticated])

  return { game, loaded }
}
