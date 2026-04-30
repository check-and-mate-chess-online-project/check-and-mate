import { useMemo } from 'react'

interface Star {
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const STAR_COUNT = 90

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 6,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }))
}

export function Starfield() {
  const stars = useMemo(() => generateStars(STAR_COUNT), [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 10 10"
          className="absolute"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <path
            d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z"
            fill="white"
          />
        </svg>
      ))}
    </div>
  )
}
