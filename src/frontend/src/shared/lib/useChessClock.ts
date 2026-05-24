import { useCallback, useEffect, useRef, useState } from 'react'

type Color = 'white' | 'black'

export interface ChessClock {
  whiteMs: number
  blackMs: number
  active: Color | null
  switchTo: (next: Color) => void
  pause: () => void
  reset: () => void
  setTimes: (whiteMs: number, blackMs: number) => void
}

export function useChessClock(
  initialMs: number,
  incrementMs: number,
): ChessClock {
  const [whiteMs, setWhiteMs] = useState(initialMs)
  const [blackMs, setBlackMs] = useState(initialMs)
  const [active, setActive] = useState<Color | null>(null)

  const activeRef = useRef<Color | null>(null)
  const anchorAtRef = useRef<number | null>(null)
  const anchorWhiteRef = useRef(initialMs)
  const anchorBlackRef = useRef(initialMs)

  useEffect(() => {
    if (active === null) return
    const id = setInterval(() => {
      if (anchorAtRef.current === null) return
      const elapsed = performance.now() - anchorAtRef.current
      if (active === 'white') {
        setWhiteMs(Math.max(0, anchorWhiteRef.current - elapsed))
      } else {
        setBlackMs(Math.max(0, anchorBlackRef.current - elapsed))
      }
    }, 100)
    return () => clearInterval(id)
  }, [active])

  const settleActive = useCallback(
    (addIncrement: boolean) => {
      const prev = activeRef.current
      if (prev === null || anchorAtRef.current === null) return
      const elapsed = performance.now() - anchorAtRef.current
      if (prev === 'white') {
        const remaining =
          Math.max(0, anchorWhiteRef.current - elapsed) +
          (addIncrement ? incrementMs : 0)
        anchorWhiteRef.current = remaining
        setWhiteMs(remaining)
      } else {
        const remaining =
          Math.max(0, anchorBlackRef.current - elapsed) +
          (addIncrement ? incrementMs : 0)
        anchorBlackRef.current = remaining
        setBlackMs(remaining)
      }
    },
    [incrementMs],
  )

  const switchTo = useCallback(
    (next: Color) => {
      settleActive(true)
      anchorAtRef.current = performance.now()
      activeRef.current = next
      setActive(next)
    },
    [settleActive],
  )

  const pause = useCallback(() => {
    settleActive(false)
    anchorAtRef.current = null
    activeRef.current = null
    setActive(null)
  }, [settleActive])

  const reset = useCallback(() => {
    anchorAtRef.current = null
    activeRef.current = null
    anchorWhiteRef.current = initialMs
    anchorBlackRef.current = initialMs
    setWhiteMs(initialMs)
    setBlackMs(initialMs)
    setActive(null)
  }, [initialMs])

  const setTimes = useCallback((w: number, b: number) => {
    const wc = Math.max(0, w)
    const bc = Math.max(0, b)
    anchorWhiteRef.current = wc
    anchorBlackRef.current = bc
    setWhiteMs(wc)
    setBlackMs(bc)
    if (activeRef.current !== null) anchorAtRef.current = performance.now()
  }, [])

  return { whiteMs, blackMs, active, switchTo, pause, reset, setTimes }
}

export function formatClock(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}
