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
  const [dots, setDots] = useState(1)
  const [prevText, setPrevText] = useState(text)

  if (text !== prevText) {
    setPrevText(text)
    setShown('')
  }

  const done = shown.length >= text.length

  useEffect(() => {
    if (done) return
    const id = setTimeout(() => {
      setShown(text.slice(0, shown.length + 1))
    }, speedMs)
    return () => clearTimeout(id)
  }, [shown, done, text, speedMs])

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
