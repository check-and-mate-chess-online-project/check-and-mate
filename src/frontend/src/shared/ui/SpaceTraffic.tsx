import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface Ship {
  top: number
  size: number
  duration: number
  delay: number
  flip: boolean
}

interface Comet {
  startTop: number
  size: number
  duration: number
  delay: number
  hue: 'cyan' | 'orange' | 'violet'
}

const SHIP_COUNT = 2
const COMET_COUNT = 4

const COMET_COLORS: Record<Comet['hue'], { head: string; tail: string }> = {
  cyan: {
    head: 'rgba(240,249,255,0.95)',
    tail: 'rgba(56,189,248,0.55)',
  },
  orange: {
    head: 'rgba(254,243,199,0.95)',
    tail: 'rgba(251,146,60,0.55)',
  },
  violet: {
    head: 'rgba(245,243,255,0.95)',
    tail: 'rgba(167,139,250,0.55)',
  },
}

function generateShips(count: number): Ship[] {
  return Array.from({ length: count }, (_, i) => ({
    top: 8 + Math.random() * 70,
    size: 36 + Math.random() * 22,
    duration: 26 + Math.random() * 22,
    delay: -Math.random() * 30 + i * 7,
    flip: false,
  }))
}

function generateComets(count: number): Comet[] {
  const hues: Comet['hue'][] = ['cyan', 'orange', 'violet']
  return Array.from({ length: count }, (_, i) => ({
    startTop: -10 + Math.random() * 40,
    size: 2 + Math.random() * 2.5,
    duration: 3 + Math.random() * 4,
    delay: -Math.random() * 20 + i * 4,
    hue: hues[i % hues.length],
  }))
}

export function SpaceTraffic() {
  const location = useLocation()
  const ships = useMemo(() => generateShips(SHIP_COUNT), [])
  const comets = useMemo(() => generateComets(COMET_COUNT), [])

  if (location.pathname.startsWith('/cases')) return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {ships.map((s, i) => (
        <div
          key={`ship-${i}`}
          className="absolute"
          style={{
            top: `${s.top}%`,
            left: 0,
            width: `${s.size * 2.6}px`,
            height: `${s.size}px`,
            animation: `ship-fly-across ${s.duration}s linear ${s.delay}s infinite`,
          }}
        >
          <div
            className="absolute"
            style={{
              top: '50%',
              right: '60%',
              transform: 'translateY(-50%)',
              width: '170%',
              height: '40%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(37,99,235,0.08) 35%, rgba(56,189,248,0.28) 85%, rgba(125,211,252,0.45) 100%)',
              filter: 'blur(8px)',
              animation: 'trail-flicker 0.6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '50%',
              right: '60%',
              transform: 'translateY(-50%)',
              width: '130%',
              height: '12%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(125,211,252,0.4) 60%, rgba(240,249,255,0.8) 100%)',
              filter: 'blur(2.5px)',
              animation: 'trail-flicker 0.35s ease-in-out infinite',
            }}
          />
          <img
            src="/little_boat.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="absolute right-0 top-0 h-full w-auto"
            style={{
              filter:
                'drop-shadow(0 0 6px rgba(56,189,248,0.4)) drop-shadow(0 0 10px rgba(0,0,0,0.6))',
            }}
          />
        </div>
      ))}
      {comets.map((c, i) => {
        const color = COMET_COLORS[c.hue]
        return (
          <div
            key={`comet-${i}`}
            className="absolute"
            style={{
              top: `${c.startTop}%`,
              left: 0,
              animation: `comet-streak ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            <div
              className="relative"
              style={{
                width: `${80 + c.size * 14}px`,
                height: `${c.size * 1.5}px`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 0%, ${color.tail} 70%, ${color.head} 100%)`,
                  filter: 'blur(1.5px)',
                  borderRadius: '999px',
                  opacity: 0.85,
                }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: `${c.size * 2.2}px`,
                  height: `${c.size * 2.2}px`,
                  background: color.head,
                  boxShadow: `0 0 ${c.size * 6}px ${color.tail}, 0 0 ${c.size * 3}px ${color.head}`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
