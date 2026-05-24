import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

interface Ship {
  bottom: number
  height: number
  duration: number
  delay: number
}

interface Comet {
  size: number
  duration: number
  delay: number
  hue: 'cyan' | 'orange' | 'violet'
}

const COMET_COUNT = 2

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

function generateShips(count: number, frequent: boolean): Ship[] {
  return Array.from({ length: count }, () => {
    const duration = frequent ? 24 + Math.random() * 14 : 80 + Math.random() * 40
    const height = 55 + Math.random() * 30
    return {
      bottom: 8 + Math.random() * 28,
      height,
      duration,
      delay: -Math.random() * duration,
    }
  })
}

function generateComets(count: number): Comet[] {
  const hues: Comet['hue'][] = ['cyan', 'orange', 'violet']
  return Array.from({ length: count }, (_, i) => ({
    size: 3 + Math.random() * 2,
    duration: 50 + Math.random() * 40,
    delay: -Math.random() * 60 - i * 15,
    hue: hues[i % hues.length],
  }))
}

export function SpaceTraffic() {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const shipCount = isLanding ? 2 : 1
  const ships = useMemo(
    () => generateShips(shipCount, isLanding),
    [shipCount, isLanding],
  )
  const comets = useMemo(() => generateComets(COMET_COUNT), [])

  if (
    location.pathname.startsWith('/cases') ||
    location.pathname.startsWith('/shop')
  )
    return null

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {ships.map((s, i) => (
        <div
          key={`ship-${i}`}
          className="absolute left-0"
          style={{
            bottom: `${s.bottom}px`,
            height: `${s.height}px`,
            width: `${s.height * 4.5}px`,
            animation: `ship-fly-ltr ${s.duration}s linear ${s.delay}s infinite`,
          }}
        >
          <div
            className="absolute"
            style={{
              top: '50%',
              left: 0,
              right: '38%',
              transform: 'translateY(-50%)',
              height: '36%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(37,99,235,0.12) 35%, rgba(56,189,248,0.32) 85%, rgba(125,211,252,0.5) 100%)',
              filter: 'blur(10px)',
              animation: 'trail-flicker 0.6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '50%',
              left: '6%',
              right: '38%',
              transform: 'translateY(-50%)',
              height: '10%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(125,211,252,0.45) 60%, rgba(240,249,255,0.85) 100%)',
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
                'drop-shadow(0 0 8px rgba(56,189,248,0.45)) drop-shadow(0 0 14px rgba(0,0,0,0.7))',
            }}
          />
        </div>
      ))}
      {comets.map((c, i) => {
        const color = COMET_COLORS[c.hue]
        const tailLength = 90 + c.size * 18
        const headSize = c.size * 2.4
        return (
          <div
            key={`comet-${i}`}
            className="absolute left-0 top-0"
            style={{
              width: `${tailLength}px`,
              height: `${headSize}px`,
              transform: 'translate3d(-30vw, -25vh, 0)',
              animation: `comet-streak ${c.duration}s linear ${c.delay}s infinite`,
            }}
          >
            <div
              className="relative"
              style={{
                width: '100%',
                height: '100%',
                transform: 'rotate(35deg)',
                transformOrigin: '100% 50%',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 0%, ${color.tail} 75%, ${color.head} 100%)`,
                  filter: 'blur(1.5px)',
                  borderRadius: '999px',
                  opacity: 0.85,
                }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: `${headSize}px`,
                  height: `${headSize}px`,
                  background: color.head,
                  boxShadow: `0 0 ${c.size * 7}px ${color.tail}, 0 0 ${c.size * 3}px ${color.head}`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
