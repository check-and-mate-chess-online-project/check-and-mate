interface Props {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`bg-slate-800 rounded-md animate-pulse ${className}`}
      aria-busy="true"
      aria-live="polite"
    />
  )
}
