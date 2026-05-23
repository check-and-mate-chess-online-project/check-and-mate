import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useMe, useOpenLootbox } from '../shared/api/hooks'
import { SkinRarity } from '../shared/api/enums'
import type { LootBoxDropResultDto } from '../shared/api'
import { ApiError } from '../shared/api/http'
import { skinImageSrc } from '../shared/lib/skinImage'

type Phase = 'idle' | 'flash' | 'launch' | 'reveal'

interface RarityPalette {
  capsule: string
  glow: string
  trail: string
  ring: string
  label: string
}

const RARITY: Record<SkinRarity, RarityPalette> = {
  [SkinRarity.Common]: {
    capsule: '#cbd5e1',
    glow: 'rgba(203,213,225,0.85)',
    trail: 'rgba(203,213,225,0.55)',
    ring: 'border-slate-300',
    label: 'common',
  },
  [SkinRarity.Rare]: {
    capsule: '#a78bfa',
    glow: 'rgba(167,139,250,0.85)',
    trail: 'rgba(167,139,250,0.6)',
    ring: 'border-violet-400',
    label: 'rare',
  },
  [SkinRarity.Legendary]: {
    capsule: '#fb923c',
    glow: 'rgba(251,146,60,0.95)',
    trail: 'rgba(251,146,60,0.65)',
    ring: 'border-orange-400',
    label: 'legendary',
  },
}

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

export function CasesPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const open = useOpenLootbox()

  const stars = useMemo(() => generateDriftStars(140), [])
  const [phase, setPhase] = useState<Phase>('idle')
  const [drop, setDrop] = useState<LootBoxDropResultDto | null>(null)

  const count = me?.lootBoxCount ?? 0
  const empty = count === 0
  const busy = phase !== 'idle' && phase !== 'reveal'

  const palette = drop ? RARITY[drop.skin.rarity] : RARITY[SkinRarity.Common]

  const handleOpen = async () => {
    if (empty || busy) return
    setDrop(null)
    setPhase('flash')
    try {
      const result = await open.mutateAsync()
      setDrop(result)
      setTimeout(() => setPhase('launch'), 220)
      setTimeout(() => setPhase('reveal'), 1700)
    } catch (e) {
      setPhase('idle')
      const msg = e instanceof ApiError && e.message ? e.message : (e as Error).message
      toast.error(msg || t('pages.cases.openFailed'))
    }
  }

  const handleClose = () => {
    setPhase('idle')
    setDrop(null)
  }

  return (
    <div className="relative h-[calc(100vh-6rem)] -mx-4 sm:-mx-6 overflow-hidden rounded-md">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-violet-950/40 to-slate-950" />

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
        <h1 className="text-3xl">{t('pages.cases.title')}</h1>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-[min(90vw,72rem)] aspect-[16/9]"
          style={{ animation: 'ship-rumble 0.25s linear infinite' }}
        >
          <div
            aria-hidden
            className="absolute top-1/2 right-[58%] h-[18%] w-[55%] -translate-y-1/2 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(251,146,60,0.55), rgba(167,139,250,0.25) 40%, transparent 80%)',
              filter: 'blur(14px)',
              animation: 'trail-flicker 0.6s ease-in-out infinite',
            }}
          />
          <div
            aria-hidden
            className="absolute top-1/2 right-[55%] h-[6%] w-[40%] -translate-y-1/2 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(255,255,255,0.9), rgba(251,146,60,0.4) 30%, transparent 75%)',
              filter: 'blur(6px)',
              animation: 'trail-flicker 0.35s ease-in-out infinite',
            }}
          />

          <img
            src="/ship.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />
        </div>
      </div>

      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            key="flash"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1.6 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: 320,
              height: 320,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(251,191,36,0.7) 35%, rgba(251,146,60,0.0) 70%)',
              filter: 'blur(4px)',
            }}
          />
        )}

        {phase === 'launch' && drop && (
          <motion.div
            key="capsule"
            initial={{ y: 0, opacity: 0, scale: 1 }}
            animate={{ y: '70vh', opacity: [0, 1, 1, 0.4], scale: 0.5 }}
            transition={{ duration: 1.5, ease: [0.4, 0.05, 0.4, 1], times: [0, 0.15, 0.8, 1] }}
            className="absolute left-1/2 top-[60%] -translate-x-1/2 pointer-events-none"
          >
            <div
              aria-hidden
              className="absolute left-1/2 -top-[40vh] -translate-x-1/2 w-[60px] h-[40vh]"
              style={{
                background: `linear-gradient(to bottom, transparent, ${palette.trail} 70%, ${palette.glow})`,
                filter: 'blur(6px)',
              }}
            />
            <div
              className="relative rounded-[40%] border-2"
              style={{
                width: 64,
                height: 96,
                background: `radial-gradient(ellipse at 50% 30%, #fff, ${palette.capsule} 55%, #1e293b 100%)`,
                borderColor: palette.capsule,
                boxShadow: `0 0 40px 6px ${palette.glow}, 0 0 90px 12px ${palette.glow}`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
        <div className="px-4 py-2 bg-slate-900/70 backdrop-blur border border-violet-900 rounded-md text-sm">
          <span className="text-slate-400 mr-2">{t('pages.cases.youHaveShort')}</span>
          <span className="text-violet-200 font-display text-lg">{count}</span>
        </div>
        <button
          type="button"
          disabled={empty || busy}
          onClick={handleOpen}
          className="px-8 py-3 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed rounded-md font-display text-lg uppercase tracking-wider shadow-lg shadow-orange-900/40 transition-colors"
        >
          {t('pages.cases.openButton')}
        </button>
      </div>

      {empty && phase === 'idle' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-sm text-slate-500">
          {t('pages.cases.noCases')}
        </div>
      )}

      <AnimatePresence>
        {phase === 'reveal' && drop && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-slate-950/90 border-2 ${palette.ring} rounded-lg p-8 max-w-sm w-[min(90vw,24rem)] text-center`}
              style={{ boxShadow: `0 0 80px 8px ${palette.glow}` }}
            >
              <div
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: palette.capsule }}
              >
                {t(`skin.rarity.${drop.skin.rarity}`)}
              </div>
              {drop.skin.idleImage ? (
                <img
                  src={skinImageSrc(drop.skin.idleImage)}
                  alt={drop.skin.name}
                  className="w-48 h-72 object-contain mx-auto mb-4"
                />
              ) : (
                <div
                  className="w-48 h-72 mx-auto mb-4 rounded-md border border-slate-800 flex items-center justify-center text-6xl"
                  style={{ background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)` }}
                >
                  ?
                </div>
              )}
              <div className="text-xl mb-1">{drop.skin.name}</div>
              {drop.isDuplicate && (
                <div className="text-sm text-slate-400 mb-3">
                  {t('pages.cases.duplicate')}
                </div>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-md text-sm"
              >
                {t('pages.cases.continue')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
