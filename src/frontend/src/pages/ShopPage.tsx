import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBuyLootbox, useMe } from '../shared/api/hooks'
import { ApiError } from '../shared/api/http'

const PRICE_PER_CASE = 100

interface Bundle {
  count: number
  glow: string
  glowSoft: string
  accent: string
  textShadow: string
  badgeKey?: 'popular' | 'bestValue'
}

const BUNDLES: Bundle[] = [
  {
    count: 1,
    glow: 'rgba(56,189,248,0.9)',
    glowSoft: 'rgba(56,189,248,0.45)',
    accent: 'text-sky-200',
    textShadow: '0 0 18px rgba(56,189,248,0.85)',
  },
  {
    count: 5,
    glow: 'rgba(167,139,250,0.95)',
    glowSoft: 'rgba(167,139,250,0.45)',
    accent: 'text-violet-200',
    textShadow: '0 0 18px rgba(167,139,250,0.85)',
    badgeKey: 'popular',
  },
  {
    count: 10,
    glow: 'rgba(251,146,60,0.95)',
    glowSoft: 'rgba(251,146,60,0.5)',
    accent: 'text-orange-200',
    textShadow: '0 0 20px rgba(251,146,60,0.9)',
    badgeKey: 'bestValue',
  },
]

interface DriftStar {
  startX: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateDriftStars(count: number): DriftStar[] {
  return Array.from({ length: count }, () => ({
    startX: 100 + Math.random() * 30,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2.5,
    duration: 14 + Math.random() * 22,
    delay: -Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.7,
  }))
}

interface CoinSpark {
  id: number
  dx: number
  delay: number
  duration: number
}

function generateCoins(count: number): CoinSpark[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    dx: -30 + Math.random() * 60,
    delay: Math.random() * 0.15,
    duration: 0.7 + Math.random() * 0.3,
  }))
}

interface OfferProps {
  bundle: Bundle
  price: number
  cantAfford: boolean
  busy: boolean
  purchased: boolean
  onBuy: () => void
}

function Offer({
  bundle,
  price,
  cantAfford,
  busy,
  purchased,
  onBuy,
}: OfferProps) {
  const { t } = useTranslation()
  const disabled = cantAfford || busy
  const coins = useMemo(() => generateCoins(8), [])

  return (
    <div className="flex flex-col items-center gap-4 relative">
      <div className="relative">
        <div
          className="font-display text-7xl leading-none"
          style={{ color: bundle.glow, textShadow: bundle.textShadow }}
        >
          ×{bundle.count}
        </div>
        {bundle.badgeKey && (
          <span
            className="absolute -top-2 -right-12 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border whitespace-nowrap"
            style={{
              color: bundle.glow,
              borderColor: bundle.glow,
              boxShadow: `0 0 10px ${bundle.glowSoft}`,
            }}
          >
            {t(`pages.shop.badges.${bundle.badgeKey}`)}
          </span>
        )}
      </div>

      <div className="relative w-[180px] h-[220px] flex items-end justify-center">
        <div
          aria-hidden
          className="absolute bottom-0 left-1/2 w-[180px] h-[40px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${bundle.glow} 0%, ${bundle.glowSoft} 35%, transparent 75%)`,
            filter: 'blur(6px)',
            animation: 'pad-pulse 2.2s ease-in-out infinite',
          }}
        />
        <div
          aria-hidden
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px w-[140px] pointer-events-none"
          style={{
            background: `linear-gradient(to right, transparent, ${bundle.glow}, transparent)`,
            boxShadow: `0 0 12px ${bundle.glow}`,
          }}
        />

        <motion.div
          animate={
            purchased
              ? { x: '30vw', y: '-65vh', scale: 0.2, opacity: 0 }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
          }
          transition={
            purchased
              ? { duration: 0.85, ease: 'easeIn' }
              : { duration: 0.3, ease: 'easeOut' }
          }
          className="relative z-10 pointer-events-none"
          style={{ animation: 'bob 2.6s ease-in-out infinite' }}
        >
          <img
            src="/boat.webp"
            alt=""
            draggable={false}
            className="w-[150px] h-auto"
            style={{
              filter: `drop-shadow(0 0 10px ${bundle.glow}) drop-shadow(0 0 24px ${bundle.glowSoft})`,
            }}
          />
        </motion.div>

        <AnimatePresence>
          {purchased &&
            coins.map((c) => (
              <motion.span
                key={c.id}
                initial={{ opacity: 0, y: 0, x: c.dx, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: -180,
                  x: c.dx + 60,
                  scale: 1,
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  times: [0, 0.15, 0.7, 1],
                  ease: 'easeOut',
                }}
                className="absolute left-1/2 top-1/2 text-yellow-300 text-lg pointer-events-none select-none"
                style={{ textShadow: '0 0 8px rgba(250,204,21,0.8)' }}
              >
                ◈
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      <div className="flex items-baseline gap-2">
        <span
          className={`font-display text-3xl tabular-nums ${
            cantAfford ? 'text-red-400' : 'text-yellow-300'
          }`}
          style={
            cantAfford
              ? undefined
              : { textShadow: '0 0 8px rgba(250,204,21,0.5)' }
          }
        >
          {price}
        </span>
        <span
          className={cantAfford ? 'text-red-400' : 'text-yellow-300'}
        >
          ◈
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onBuy}
        className={
          disabled
            ? 'mt-1 px-7 py-2.5 rounded-md font-display uppercase tracking-[0.25em] text-sm bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'mt-1 px-7 py-2.5 rounded-md font-display uppercase tracking-[0.25em] text-sm bg-slate-950/70 hover:bg-slate-900/90 backdrop-blur border-2 transition-colors'
        }
        style={
          disabled
            ? undefined
            : {
                color: bundle.glow,
                borderColor: bundle.glow,
                boxShadow: `0 0 14px ${bundle.glowSoft}, inset 0 0 14px ${bundle.glowSoft}`,
              }
        }
      >
        {cantAfford
          ? t('pages.shop.notEnoughBalance')
          : busy
            ? '…'
            : t('pages.shop.purchase')}
      </button>
    </div>
  )
}

export function ShopPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const buy = useBuyLootbox()
  const stars = useMemo(() => generateDriftStars(140), [])
  const [purchasingIdx, setPurchasingIdx] = useState<number | null>(null)
  const [purchasedIdx, setPurchasedIdx] = useState<number | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/boat.webp'
    const planet = new Image()
    planet.src = '/planets/earth_big.webp'
  }, [])

  const balance = me?.balance ?? 0

  const handleBuy = (bundle: Bundle, idx: number) => {
    const total = bundle.count * PRICE_PER_CASE
    if (balance < total || purchasingIdx !== null) return
    setPurchasingIdx(idx)
    setPurchasedIdx(idx)
    buy.mutate(bundle.count, {
      onSuccess: () => {
        toast.success(t('pages.shop.purchased', { count: bundle.count }))
      },
      onError: (e) => {
        const msg =
          e instanceof ApiError && e.message
            ? e.message
            : (e as Error).message
        toast.error(msg || t('pages.shop.buyFailed'))
      },
      onSettled: () => {
        window.setTimeout(() => {
          setPurchasingIdx(null)
          setPurchasedIdx(null)
        }, 1000)
      },
    })
  }

  return (
    <div className="fixed left-0 right-0 top-[81px] bottom-0 z-10 bg-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.startX}vw`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animation: `drift-left ${s.duration}s linear ${s.delay}s infinite`,
              boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,${s.opacity * 0.6})`,
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: '95vh',
          height: '95vh',
          right: '-30vh',
          bottom: '-40vh',
          backgroundImage: 'url(/planets/earth_big.webp)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(0.55) saturate(0.85)',
          opacity: 0.6,
          animation: 'planet-rotate 240s linear infinite',
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          width: '95vh',
          height: '95vh',
          right: '-30vh',
          bottom: '-40vh',
          background:
            'radial-gradient(circle at 30% 35%, rgba(96,165,250,0.18) 0%, transparent 55%)',
          filter: 'blur(20px)',
        }}
      />

      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-3xl">{t('pages.shop.title')}</h1>
        <p className="text-xs text-violet-400/70 mt-1 font-mono uppercase tracking-[0.3em]">
          {t('pages.shop.terminalSubtitle')}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full max-w-5xl">
          {BUNDLES.map((b, idx) => {
            const total = b.count * PRICE_PER_CASE
            return (
              <Offer
                key={b.count}
                bundle={b}
                price={total}
                cantAfford={balance < total}
                busy={purchasingIdx === idx}
                purchased={purchasedIdx === idx}
                onBuy={() => handleBuy(b, idx)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
