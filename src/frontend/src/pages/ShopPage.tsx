import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useBuyLootbox, useMe } from '../shared/api/hooks'
import { ApiError } from '../shared/api/http'

const PRICE_PER_CASE = 100

interface Bundle {
  count: number
  badgeKey?: 'popular' | 'bestValue'
}

const BUNDLES: Bundle[] = [
  { count: 1 },
  { count: 5, badgeKey: 'popular' },
  { count: 10, badgeKey: 'bestValue' },
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

interface TerminalProps {
  bundle: Bundle
  price: number
  cantAfford: boolean
  busy: boolean
  purchased: boolean
  onBuy: () => void
}

function Terminal({
  bundle,
  price,
  cantAfford,
  busy,
  purchased,
  onBuy,
}: TerminalProps) {
  const { t } = useTranslation()
  const disabled = cantAfford || busy

  return (
    <div className="relative group">
      <div
        aria-hidden
        className="absolute -inset-1 rounded-lg blur-md opacity-50 group-hover:opacity-90 transition-opacity"
        style={{
          background:
            'linear-gradient(180deg, rgba(34,211,238,0.45), rgba(167,139,250,0.25), rgba(34,211,238,0.45))',
        }}
      />

      <div
        className="relative rounded-lg overflow-hidden border-2 border-cyan-500/60 bg-slate-950/85 backdrop-blur"
        style={{ animation: 'terminal-flicker 8s linear infinite' }}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/40 px-3 py-1.5 bg-gradient-to-r from-cyan-950/70 to-violet-950/70">
          <div className="text-[11px] text-cyan-300 font-mono uppercase tracking-[0.25em]">
            UNIT-{String(bundle.count).padStart(2, '0')}
          </div>
          {bundle.badgeKey && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange-300 border border-orange-500/60 px-1.5 py-0.5 rounded-sm">
              {t(`pages.shop.badges.${bundle.badgeKey}`)}
            </span>
          )}
        </div>

        <div className="relative aspect-[3/4] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-cyan-950/30 to-slate-950">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(34,211,238,0.07) 0px, rgba(34,211,238,0.07) 1px, transparent 1px, transparent 3px)',
              animation: 'scanline-shift 0.6s linear infinite',
            }}
          />

          <div
            aria-hidden
            className="absolute left-0 right-0 h-16 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(34,211,238,0.18) 50%, transparent 100%)',
              filter: 'blur(2px)',
              animation: 'scan-beam 5s ease-in-out infinite',
            }}
          />

          <motion.div
            animate={
              purchased
                ? { scale: 0.2, opacity: 0, y: -120 }
                : { y: [0, -8, 0] }
            }
            transition={
              purchased
                ? { duration: 0.7, ease: 'easeIn' }
                : {
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
            className="relative pointer-events-none"
          >
            <img
              src="/boat.webp"
              alt=""
              draggable={false}
              className="w-[140px] h-auto"
              style={{
                filter:
                  'drop-shadow(0 0 10px rgba(34,211,238,0.7)) drop-shadow(0 0 24px rgba(167,139,250,0.45))',
              }}
            />
          </motion.div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
            <div
              className="font-display text-5xl text-cyan-100 leading-none"
              style={{ textShadow: '0 0 14px rgba(34,211,238,0.8)' }}
            >
              ×{bundle.count}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/70">
              {t('pages.shop.caseTitle')}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-cyan-500/40 bg-slate-950/85">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-slate-500 uppercase tracking-[0.25em] font-mono">
              {t('pages.shop.total')}
            </span>
            <span
              className={`font-display text-2xl tabular-nums ${
                cantAfford ? 'text-red-400' : 'text-yellow-400'
              }`}
              style={
                cantAfford
                  ? undefined
                  : { textShadow: '0 0 8px rgba(250,204,21,0.45)' }
              }
            >
              {price} ◈
            </span>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={onBuy}
            className={
              disabled
                ? 'w-full px-4 py-2.5 rounded-md font-display uppercase tracking-[0.2em] text-sm bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'w-full px-4 py-2.5 rounded-md font-display uppercase tracking-[0.2em] text-sm bg-gradient-to-b from-cyan-500 to-violet-700 hover:from-cyan-400 hover:to-violet-600 text-slate-50 border border-cyan-400 shadow-lg shadow-cyan-900/40 transition-colors'
            }
          >
            {cantAfford
              ? t('pages.shop.notEnoughBalance')
              : busy
                ? '…'
                : t('pages.shop.purchase')}
          </button>
        </div>
      </div>
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
  }, [])

  const balance = me?.balance ?? 0

  const handleBuy = (bundle: Bundle, idx: number) => {
    const total = bundle.count * PRICE_PER_CASE
    if (balance < total || purchasingIdx !== null) return
    setPurchasingIdx(idx)
    setPurchasedIdx(idx)
    buy.mutate(bundle.count, {
      onSuccess: () => {
        toast.success(
          t('pages.shop.purchased', { count: bundle.count }),
        )
      },
      onError: (e) => {
        const msg =
          e instanceof ApiError && e.message
            ? e.message
            : (e as Error).message
        toast.error(msg || t('pages.shop.buyFailed'))
        setPurchasedIdx(null)
      },
      onSettled: () => {
        window.setTimeout(() => {
          setPurchasingIdx(null)
          setPurchasedIdx(null)
        }, 900)
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

      <div className="absolute top-6 left-6 z-20">
        <h1 className="text-3xl">{t('pages.shop.title')}</h1>
        <p className="text-xs text-cyan-500/70 mt-1 font-mono uppercase tracking-[0.3em]">
          {t('pages.shop.terminalSubtitle')}
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {BUNDLES.map((b, idx) => {
            const total = b.count * PRICE_PER_CASE
            return (
              <Terminal
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
