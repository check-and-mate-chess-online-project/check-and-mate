import type { CSSProperties } from 'react'

interface Props {
  className?: string
  style?: CSSProperties
}

export function Skeleton({ className = '', style }: Props) {
  return (
    <div
      className={`bg-slate-800 rounded-md animate-pulse ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  )
}
