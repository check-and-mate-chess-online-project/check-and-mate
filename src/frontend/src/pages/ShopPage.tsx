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

const THRUSTER_POSITIONS = [
  { left: '32%', delay: '0s' },
  { left: '50%', delay: '0.12s' },
  { left: '68%', delay: '0.24s' },
]

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

      <div className="absolute inset-0 flex items-center justify-center pr-0 lg:pr-[26rem]">
        <div
          className="relative"
          style={{ width: '55vh', height: '55vh', maxWidth: '80vw' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.04) 50%, transparent 75%)',
              filter: 'blur(24px)',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/planets/case-planetwebp.webp)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: 'planet-rotate 90s linear infinite',
              filter: 'drop-shadow(0 0 28px rgba(56,189,248,0.25))',
            }}
          />

          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              transformOrigin: '50% 50%',
              animation: 'orbit-swing 7s ease-in-out infinite',
            }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: '-6%' }}
            >
              <div style={{ animation: 'orbit-dip 7s ease-in-out infinite' }}>
                <div
                  style={{
                    animation: 'counter-swing 7s ease-in-out infinite',
                    transformOrigin: 'center',
                  }}
                >
                  <div
                    style={{ animation: 'bob 2.6s ease-in-out infinite' }}
                  >
                    <div
                      className="relative"
                      style={{ width: '180px' }}
                    >
                      <img
                        src="/boat.webp"
                        alt=""
                        draggable={false}
                        className="block w-full h-auto"
                      />
                      {THRUSTER_POSITIONS.map((p, i) => (
                        <div
                          key={i}
                          aria-hidden
                          className="absolute pointer-events-none"
                          style={{
                            left: p.left,
                            bottom: '-6%',
                            width: '12%',
                            height: '34%',
                            transformOrigin: 'top',
                            background:
                              'radial-gradient(ellipse at 50% 0%, rgba(254,243,199,0.95) 0%, rgba(251,146,60,0.85) 22%, rgba(239,68,68,0.7) 50%, rgba(127,29,29,0.25) 80%, transparent 100%)',
                            filter: 'blur(2px)',
                            animation: `thruster-fire 7s ease-in-out ${p.delay} infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-[min(90vw,24rem)]">
        <div className="bg-slate-950/85 backdrop-blur border border-violet-800/70 rounded-lg px-6 py-6 shadow-[0_0_28px_rgba(56,189,248,0.18)]">
          <div className="mb-5">
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono">
              {t('pages.shop.amount')}
            </div>
            <div className="font-display text-5xl text-violet-200 tabular-nums leading-none mt-2">
              ×{count}
            </div>
          </div>

          <input
            type="range"
            min={MIN_COUNT}
            max={MAX_COUNT}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-violet-500 mb-2 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-6">
            <span>{MIN_COUNT}</span>
            <span>{MAX_COUNT}</span>
          </div>

          <div className="border-t border-slate-800 pt-4 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-mono">
                {t('pages.shop.total')}
              </span>
              <span
                className={`font-display text-3xl tabular-nums leading-none ${
                  notEnough ? 'text-red-400' : 'text-yellow-300'
                }`}
                style={
                  notEnough
                    ? undefined
                    : { textShadow: '0 0 10px rgba(250,204,21,0.45)' }
                }
              >
                {total} ◈
              </span>
            </div>
          </div>

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
