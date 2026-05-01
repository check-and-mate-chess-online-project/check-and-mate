import { useEffect, useState } from 'react'

interface Props {
  text: string
  speedMs?: number
  dotIntervalMs?: number
}

export function TypedText({
  text,
  speedMs = 45,
  dotIntervalMs = 400,
}: Props) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)
  const [dots, setDots] = useState(1)

  useEffect(() => {
    setShown('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speedMs)
    return () => clearInterval(id)
  }, [text, speedMs])

  useEffect(() => {
    if (!done) return
    const id = setInterval(() => {
      setDots((d) => (d % 3) + 1)
    }, dotIntervalMs)
    return () => clearInterval(id)
  }, [done, dotIntervalMs])

  return (
    <>
      {shown}
      <span className="inline-block w-8 text-left">
        {done ? '.'.repeat(dots) : ''}
      </span>
    </>
  )
}
