import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useBuyLootbox, useMe } from '../shared/api/hooks'
import { ApiError } from '../shared/api/http'

const PRICE_PER_CASE = 100
const MIN_COUNT = 1
const MAX_COUNT = 10
const LANDING_CYCLE = '16s'
const ORBIT_CYCLE = '48s'

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

const BOTTOM_THRUSTERS = [
  { left: '32%', delay: '0s' },
  { left: '50%', delay: '0.12s' },
  { left: '68%', delay: '0.24s' },
]

const FLAME_GRADIENT =
  'radial-gradient(ellipse at 50% 0%, rgba(254,243,199,0.95) 0%, rgba(251,146,60,0.85) 22%, rgba(239,68,68,0.7) 50%, rgba(127,29,29,0.25) 80%, transparent 100%)'

const SIDE_FLAME_GRADIENT =
  'radial-gradient(ellipse at 0% 50%, rgba(240,249,255,0.95) 0%, rgba(125,211,252,0.8) 30%, rgba(14,165,233,0.48) 62%, transparent 100%)'

const SIDE_FLAME_GRADIENT_REVERSED =
  'radial-gradient(ellipse at 100% 50%, rgba(240,249,255,0.95) 0%, rgba(125,211,252,0.8) 30%, rgba(14,165,233,0.48) 62%, transparent 100%)'

function CornerBracket({
  position,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
}) {
  const base = 'absolute w-5 h-5 border-cyan-400/80 pointer-events-none'
  const pos = {
    tl: '-top-1 -left-1 border-t-2 border-l-2',
    tr: '-top-1 -right-1 border-t-2 border-r-2',
    bl: '-bottom-1 -left-1 border-b-2 border-l-2',
    br: '-bottom-1 -right-1 border-b-2 border-r-2',
  }[position]
  return (
    <div
      aria-hidden
      className={`${base} ${pos}`}
      style={{
        boxShadow: '0 0 8px rgba(34,211,238,0.5)',
      }}
    />
  )
}

export function ShopPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const buy = useBuyLootbox()
  const stars = useMemo(() => generateTwinkleStars(180), [])
  const [count, setCount] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [purchasedCount, setPurchasedCount] = useState(0)

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
    setPurchasedCount(0)
    buy.mutate(count, {
      onSuccess: () => {
        setPurchasedCount(count)
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="fixed left-0 right-0 top-[calc(5rem+1px)] bottom-0 z-10 bg-black overflow-hidden"
    >
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

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="absolute top-6 left-6 z-20"
      >
        <h1 className="text-3xl">{t('pages.shop.title')}</h1>
        <p className="text-xs text-violet-400/70 mt-1 font-mono uppercase tracking-[0.3em]">
          {t('pages.shop.terminalSubtitle')}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 60, scale: 0.94 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 0.84, 0.32, 1] }}
        className="absolute pointer-events-none"
        style={{
          right: '12vw',
          top: '50%',
          translate: '0 -50%',
        }}
      >
        <div
          className="relative"
          style={{ width: 'min(62vh, 50vw)', aspectRatio: '1' }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0.04) 50%, transparent 75%)',
              filter: 'blur(28px)',
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
              animation: 'planet-rotate 120s linear infinite',
              filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.25))',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              transformOrigin: '50% 50%',
              animation: `landing-orbit ${ORBIT_CYCLE} linear infinite`,
            }}
          >
            <div
              className="absolute left-1/2"
              style={{
                top: '-30%',
                transformOrigin: '50% 50%',
                animation: `landing-path ${LANDING_CYCLE} linear infinite`,
              }}
            >
              <div
                style={{
                  animation: `landing-tilt ${LANDING_CYCLE} linear infinite`,
                }}
              >
                <div
                  style={{
                    animation: `thrust-shake ${LANDING_CYCLE} linear infinite`,
                  }}
                >
                  <div className="relative" style={{ width: '210px' }}>
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        inset: '-24%',
                        borderRadius: '45%',
                        background:
                          'radial-gradient(ellipse at 50% 58%, rgba(56,189,248,0.32) 0%, rgba(56,189,248,0.18) 34%, transparent 62%), radial-gradient(ellipse at 52% 60%, transparent 0%, transparent 34%, rgba(248,113,113,0.34) 46%, transparent 68%)',
                        filter: 'blur(7px)',
                        mixBlendMode: 'screen',
                        animation: `atmosphere-glow ${LANDING_CYCLE} ease-in-out infinite`,
                      }}
                    />
                    <img
                      src="/boat.webp"
                      alt=""
                      draggable={false}
                      className="block w-full h-auto relative"
                      style={{
                        animation: `reentry-hull-glow ${LANDING_CYCLE} ease-in-out infinite`,
                      }}
                    />
                    {BOTTOM_THRUSTERS.map((p, i) => (
                      <div
                        key={i}
                        aria-hidden
                        className="absolute pointer-events-none rounded-full"
                        style={{
                          left: p.left,
                          bottom: '-30%',
                          width: '12%',
                          height: '38%',
                          transformOrigin: 'top',
                          background: FLAME_GRADIENT,
                          filter: 'blur(2px)',
                          animation: `thruster-fire ${LANDING_CYCLE} ease-in-out ${p.delay} infinite`,
                        }}
                      />
                    ))}
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        top: '25%',
                        left: '70%',
                        width: '26%',
                        height: '9%',
                        transformOrigin: 'left center',
                        background: SIDE_FLAME_GRADIENT,
                        filter: 'blur(1.5px)',
                        animation: `side-thrust-right ${LANDING_CYCLE} ease-in-out infinite`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        top: '25%',
                        right: '70%',
                        width: '26%',
                        height: '9%',
                        transformOrigin: 'right center',
                        background: SIDE_FLAME_GRADIENT_REVERSED,
                        filter: 'blur(1.5px)',
                        animation: `side-thrust-left ${LANDING_CYCLE} ease-in-out infinite`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        left: '50%',
                        bottom: '-30%',
                        width: '58%',
                        height: '20%',
                        transform: 'translateX(-50%)',
                        borderRadius: '999px',
                        background:
                          'radial-gradient(ellipse at 50% 50%, rgba(251,146,60,0.3) 0%, rgba(251,146,60,0.16) 38%, transparent 70%)',
                        filter: 'blur(6px)',
                        animation: `escape-wake ${LANDING_CYCLE} ease-in-out infinite`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -36, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.62, delay: 0.12, ease: [0.16, 0.84, 0.32, 1] }}
        className="absolute z-20 w-[min(94vw,28rem)]"
        style={{
          left: '24%',
          top: '50%',
          translate: '-50% -50%',
        }}
      >
        <div className="relative">
          <CornerBracket position="tl" />
          <CornerBracket position="tr" />
          <CornerBracket position="bl" />
          <CornerBracket position="br" />

          <div className="bg-slate-950/85 backdrop-blur border border-violet-800/50 rounded-md px-7 pt-4 pb-7 shadow-[0_0_36px_rgba(34,211,238,0.12)]">
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.3em] text-cyan-400/80 border-b border-cyan-500/20 pb-2 mb-5">
              <span>{t('pages.shop.deckTitle')}</span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                  style={{
                    boxShadow: '0 0 6px rgba(52,211,153,0.9)',
                    animation: 'twinkle 1.6s ease-in-out infinite',
                  }}
                />
                <span className="text-emerald-300/80">ONLINE</span>
              </span>
            </div>

            <div className="mb-2">
              <div className="text-xs text-slate-500 uppercase tracking-[0.25em] font-mono">
                {t('pages.shop.amount')}
              </div>
              <div className="font-display text-7xl text-violet-100 tabular-nums leading-none mt-1">
                ×{count}
              </div>
            </div>

            <input
              type="range"
              min={MIN_COUNT}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-violet-500 mb-1 cursor-pointer mt-3 h-2"
            />
            <div className="flex justify-between text-xs font-mono text-slate-600 mb-5">
              {Array.from({ length: MAX_COUNT }, (_, i) => i + 1).map((n) => (
                <span
                  key={n}
                  className={n === count ? 'text-violet-300' : ''}
                >
                  {n}
                </span>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 uppercase tracking-[0.25em] font-mono">
                  {t('pages.shop.total')}
                </span>
                <span
                  className={`font-display text-4xl tabular-nums leading-none ${
                    notEnough ? 'text-red-400' : ''
                  }`}
                  style={
                    notEnough
                      ? undefined
                      : {
                          color: '#e8a763',
                          textShadow:
                            '0 0 12px rgba(232,167,99,0.55), 0 0 26px rgba(180,83,9,0.3)',
                        }
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
                notEnough
                  ? 'w-full px-4 py-3 rounded-md font-display uppercase tracking-[0.25em] text-sm text-violet-200 bg-violet-950/40 border border-violet-500/50 shadow-[0_0_18px_rgba(167,139,250,0.18),inset_0_1px_0_rgba(167,139,250,0.18)] cursor-not-allowed backdrop-blur-sm'
                  : purchasing
                    ? 'w-full px-4 py-3 rounded-md font-display uppercase tracking-[0.25em] text-sm text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 border border-orange-300/40 shadow-[0_4px_22px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] opacity-80 cursor-wait backdrop-blur-sm'
                    : 'w-full px-4 py-3 rounded-md font-display uppercase tracking-[0.25em] text-sm text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 shadow-[0_4px_22px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_4px_30px_rgba(251,146,60,0.62),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-px transition-all backdrop-blur-sm'
              }
            >
              {notEnough
                ? t('pages.shop.notEnoughBalance')
                : purchasing
                  ? '…'
                  : t('pages.shop.purchase')}
            </button>

            {purchasedCount > 0 && !purchasing && (
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="w-full mt-3 px-4 py-3 rounded-md font-display uppercase tracking-[0.22em] text-xs bg-cyan-500/12 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-400/35 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition-colors"
              >
                {t('pages.shop.openCases')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
