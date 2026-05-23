import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBuyLootbox, useMe } from '../shared/api/hooks'
import { ApiError } from '../shared/api/http'

const PRICE_PER_CASE = 100
const MIN_COUNT = 1
const MAX_COUNT = 10

interface TwinkleStar {
  x: number
  y: number
  size: number
  duration: number
  delay: number
  baseOpacity: number
}

function generateTwinkleStars(count: number): TwinkleStar[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 2.5 + Math.random() * 4,
    delay: Math.random() * 4,
    baseOpacity: 0.35 + Math.random() * 0.55,
  }))
}

export function ShopPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const buy = useBuyLootbox()
  const stars = useMemo(() => generateTwinkleStars(180), [])
  const [count, setCount] = useState(1)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const planet = new Image()
    planet.src = '/planets/case-planetwebp.webp'
    const boat = new Image()
    boat.src = '/boat.webp'
  }, [])

  const balance = me?.balance ?? 0
  const total = count * PRICE_PER_CASE
  const notEnough = balance < total
  const disabled = notEnough || purchasing

  const handleBuy = () => {
    if (disabled) return
    setPurchasing(true)
    buy.mutate(count, {
      onSuccess: () => {
        toast.success(t('pages.shop.purchased', { count }))
      },
      onError: (e) => {
        const msg =
          e instanceof ApiError && e.message
            ? e.message
            : (e as Error).message
        toast.error(msg || t('pages.shop.buyFailed'))
      },
      onSettled: () => {
        window.setTimeout(() => setPurchasing(false), 400)
      },
    })
  }

  return (
    <div className="fixed left-0 right-0 top-[81px] bottom-0 z-10 bg-black overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: s.baseOpacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,${s.baseOpacity * 0.6})`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-3xl">{t('pages.shop.title')}</h1>
        <p className="text-xs text-violet-400/70 mt-1 font-mono uppercase tracking-[0.3em]">
          {t('pages.shop.terminalSubtitle')}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative"
          style={{ width: '60vh', height: '60vh' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.05) 50%, transparent 75%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url(/planets/case-planetwebp.webp)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'planet-rotate 90s linear infinite',
              filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.25))',
            }}
          />

          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ top: '-12%' }}
          >
            <div style={{ animation: 'bob 2.6s ease-in-out infinite' }}>
              <div className="relative">
                <img
                  src="/boat.webp"
                  alt=""
                  draggable={false}
                  className="w-[140px] h-auto"
                  style={{
                    filter:
                      'drop-shadow(0 0 6px rgba(186,230,253,0.85)) drop-shadow(0 0 18px rgba(56,189,248,0.55))',
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 pointer-events-none"
                  style={{
                    bottom: '-10%',
                    width: '20%',
                    height: '38%',
                    transformOrigin: 'top',
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.95) 0%, rgba(186,230,253,0.85) 25%, rgba(56,189,248,0.55) 55%, transparent 90%)',
                    filter: 'blur(2px)',
                    animation:
                      'thruster-pulse 0.9s ease-in-out infinite',
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 pointer-events-none"
                  style={{
                    bottom: '-6%',
                    width: '14%',
                    height: '28%',
                    marginLeft: '-22%',
                    transformOrigin: 'top',
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.75) 25%, rgba(56,189,248,0.45) 60%, transparent 90%)',
                    filter: 'blur(2px)',
                    animation:
                      'thruster-pulse 1.1s ease-in-out 0.15s infinite',
                  }}
                />
                <div
                  aria-hidden
                  className="absolute left-1/2 pointer-events-none"
                  style={{
                    bottom: '-6%',
                    width: '14%',
                    height: '28%',
                    marginLeft: '8%',
                    transformOrigin: 'top',
                    background:
                      'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.75) 25%, rgba(56,189,248,0.45) 60%, transparent 90%)',
                    filter: 'blur(2px)',
                    animation:
                      'thruster-pulse 1.0s ease-in-out 0.3s infinite',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-[min(92vw,38rem)]">
        <div className="bg-slate-950/80 backdrop-blur border border-violet-800/70 rounded-lg px-6 py-5 shadow-[0_0_28px_rgba(56,189,248,0.18)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono">
                {t('pages.shop.total')}
              </div>
              <div
                className={`font-display text-3xl tabular-nums leading-none mt-1 ${
                  notEnough ? 'text-red-400' : 'text-yellow-300'
                }`}
                style={
                  notEnough
                    ? undefined
                    : { textShadow: '0 0 10px rgba(250,204,21,0.45)' }
                }
              >
                {total} ◈
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono">
                {t('pages.shop.amount')}
              </div>
              <div className="font-display text-3xl text-violet-200 tabular-nums leading-none mt-1">
                ×{count}
              </div>
            </div>
          </div>

          <input
            type="range"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-violet-500 mb-4 cursor-pointer"
          />

          <button
            type="button"
            disabled={disabled}
            onClick={handleBuy}
            className={
              disabled
                ? 'w-full px-4 py-3 rounded-md font-display uppercase tracking-[0.25em] text-sm bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'w-full px-4 py-3 rounded-md font-display uppercase tracking-[0.25em] text-sm bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 text-slate-50 shadow-lg shadow-orange-900/40 transition-colors'
            }
          >
            {notEnough
              ? t('pages.shop.notEnoughBalance')
              : purchasing
                ? '…'
                : t('pages.shop.purchase')}
          </button>
        </div>
      </div>
    </div>
  )
}
