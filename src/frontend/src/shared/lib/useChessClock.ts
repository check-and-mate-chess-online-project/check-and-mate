import { useCallback, useEffect, useRef, useState } from 'react'

type Color = 'white' | 'black'

export interface ChessClock {
  whiteMs: number
  blackMs: number
  active: Color | null
  switchTo: (next: Color) => void
  pause: () => void
  reset: () => void
}

export function useChessClock(
  initialMs: number,
  incrementMs: number,
): ChessClock {
  const whiteRef = useRef(initialMs)
  const blackRef = useRef(initialMs)
  const activeRef = useRef<Color | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const [, force] = useState(0)

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 100)
    return () => clearInterval(id)
  }, [])

  const switchTo = useCallback(
    (next: Color) => {
      const now = performance.now()
      if (activeRef.current !== null && startedAtRef.current !== null) {
        const elapsed = now - startedAtRef.current
        if (activeRef.current === 'white') {
          whiteRef.current =
            Math.max(0, whiteRef.current - elapsed) + incrementMs
        } else {
          blackRef.current =
            Math.max(0, blackRef.current - elapsed) + incrementMs
        }
      }
      activeRef.current = next
      startedAtRef.current = now
      force((n) => n + 1)
    },
    [incrementMs],
  )

  const pause = useCallback(() => {
    const now = performance.now()
    if (activeRef.current !== null && startedAtRef.current !== null) {
      const elapsed = now - startedAtRef.current
      if (activeRef.current === 'white') {
        whiteRef.current = Math.max(0, whiteRef.current - elapsed)
      } else {
        blackRef.current = Math.max(0, blackRef.current - elapsed)
      }
    }
    activeRef.current = null
    startedAtRef.current = null
    force((n) => n + 1)
  }, [])

  const reset = useCallback(() => {
    whiteRef.current = initialMs
    blackRef.current = initialMs
    activeRef.current = null
    startedAtRef.current = null
    force((n) => n + 1)
  }, [initialMs])

  const now = performance.now()
  const computed = (color: Color): number => {
    if (activeRef.current === color && startedAtRef.current !== null) {
      const ref = color === 'white' ? whiteRef.current : blackRef.current
      return Math.max(0, ref - (now - startedAtRef.current))
    }
    return color === 'white' ? whiteRef.current : blackRef.current
  }

  return {
    whiteMs: computed('white'),
    blackMs: computed('black'),
    active: activeRef.current,
    switchTo,
    pause,
    reset,
  }
}

export function formatClock(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
