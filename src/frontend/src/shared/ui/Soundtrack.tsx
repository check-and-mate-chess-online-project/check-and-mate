import { useEffect, useRef } from 'react'
import { useSoundStore } from '../lib/sound'

const SOUNDTRACK_SRC = '/soundtrack.mp3'
const BASE_VOLUME = 0.18

export function Soundtrack() {
  const muted = useSoundStore((s) => s.muted)
  const volume = useSoundStore((s) => s.volume)
  const ref = useRef<HTMLAudioElement | null>(null)
  const startedRef = useRef(false)
  const mutedRef = useRef(muted)
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  useEffect(() => {
    const audio = new Audio(SOUNDTRACK_SRC)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0
    ref.current = audio

    const tryStart = () => {
      if (startedRef.current) return
      if (mutedRef.current) return
      audio
        .play()
        .then(() => {
          startedRef.current = true
        })
        .catch(() => {
          /* autoplay blocked, retry on next interaction */
        })
    }

    tryStart()
    window.addEventListener('pointerdown', tryStart)
    window.addEventListener('keydown', tryStart)

    return () => {
      window.removeEventListener('pointerdown', tryStart)
      window.removeEventListener('keydown', tryStart)
      audio.pause()
      audio.src = ''
      ref.current = null
      startedRef.current = false
    }
  }, [])

  useEffect(() => {
    const audio = ref.current
    if (!audio) return
    audio.volume = muted ? 0 : BASE_VOLUME * volume
    if (muted) {
      audio.pause()
    } else if (startedRef.current && audio.paused) {
      audio.play().catch(() => {})
    }
  }, [muted, volume])

  return null
}
