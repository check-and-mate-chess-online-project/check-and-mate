import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useMe, useOpenLootbox } from '../shared/api/hooks'
import { FigureType, SkinRarity } from '../shared/api/enums'
import type { LootBoxDropResultDto } from '../shared/api'
import { ApiError } from '../shared/api/http'
import { skinImageSrc } from '../shared/lib/skinImage'

const FAKE_RARITY: Record<string, SkinRarity> = {
  common: SkinRarity.Common,
  rare: SkinRarity.Rare,
  legendary: SkinRarity.Legendary,
}

function makeFakeDrop(rarity: SkinRarity): LootBoxDropResultDto {
  return {
    isDuplicate: false,
    skin: {
      id: 'fake',
      setId: 'fake',
      name: 'Test Skin',
      description:
        'Test description for the dropped skin. The actual lore will come from the backend.',
      figure: FigureType.King,
      rarity,
      whiteBoardImage: '',
      blackBoardImage: '',
      idleImage: '',
      startFightWinImage: '',
      startFightLoseImage: '',
      endFightWinImage: '',
      endFightLoseImage: '',
      isDefault: false,
    },
  }
}

type Phase = 'idle' | 'flash' | 'descent' | 'whiteflash' | 'reveal'

interface RarityPalette {
  glow: string
  trail: string
  ring: string
  text: string
}

const RARITY: Record<SkinRarity, RarityPalette> = {
  [SkinRarity.Common]: {
    glow: 'rgba(203,213,225,0.85)',
    trail: 'rgba(203,213,225,0.65)',
    ring: 'border-slate-300',
    text: 'text-slate-200',
  },
  [SkinRarity.Rare]: {
    glow: 'rgba(167,139,250,0.9)',
    trail: 'rgba(167,139,250,0.7)',
    ring: 'border-violet-400',
    text: 'text-violet-300',
  },
  [SkinRarity.Legendary]: {
    glow: 'rgba(251,146,60,0.95)',
    trail: 'rgba(251,146,60,0.75)',
    ring: 'border-orange-400',
    text: 'text-orange-300',
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

interface AscendStar {
  x: number
  startY: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateAscendStars(count: number): AscendStar[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    startY: 100 + Math.random() * 30,
    size: 1 + Math.random() * 3,
    duration: 0.6 + Math.random() * 1.4,
    delay: -Math.random() * 1.5,
    opacity: 0.4 + Math.random() * 0.6,
  }))
}

export function CasesPage() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const open = useOpenLootbox()
  const [searchParams] = useSearchParams()
  const fakeRarity = searchParams.get('fake')
    ? FAKE_RARITY[searchParams.get('fake') ?? '']
    : undefined

  const stars = useMemo(() => generateDriftStars(140), [])
  const ascendStars = useMemo(() => generateAscendStars(70), [])
  const [phase, setPhase] = useState<Phase>('idle')
  const [drop, setDrop] = useState<LootBoxDropResultDto | null>(null)
  const [shipEntered, setShipEntered] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  useEffect(() => {
    const id = window.setTimeout(() => setShipEntered(true), 1100)
    const preload = new Image()
    preload.src = '/boat.webp'
    return () => window.clearTimeout(id)
  }, [])

  const count = me?.lootBoxCount ?? 0
  const empty = count === 0 && !fakeRarity
  const animating = phase !== 'idle'
  const palette = drop ? RARITY[drop.skin.rarity] : RARITY[SkinRarity.Common]
  const shipLifted =
    phase === 'descent' || phase === 'whiteflash' || phase === 'reveal'
  const descentVisible = phase === 'descent' || phase === 'whiteflash'

  const clearScheduled = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  useEffect(() => clearScheduled, [])

  const schedule = (fn: () => void, ms: number) => {
    timeoutsRef.current.push(window.setTimeout(fn, ms))
  }

  const runAnimation = (result: LootBoxDropResultDto) => {
    setDrop(result)
    schedule(() => setPhase('descent'), 600)
    schedule(() => setPhase('whiteflash'), 600 + 2200)
    schedule(() => setPhase('reveal'), 600 + 2200 + 180)
  }

  const handleOpen = async () => {
    if (empty || animating) return
    clearScheduled()
    setDrop(null)
    setPhase('flash')

    if (fakeRarity) {
      runAnimation(makeFakeDrop(fakeRarity))
      return
    }

    try {
      const result = await open.mutateAsync()
      runAnimation(result)
    } catch (e) {
      setPhase('idle')
      const msg = e instanceof ApiError && e.message ? e.message : (e as Error).message
      toast.error(msg || t('pages.cases.openFailed'))
    }
  }

  const handleClose = () => {
    clearScheduled()
    setPhase('idle')
    setDrop(null)
  }

  return (
    <div className="fixed left-0 right-0 top-[81px] bottom-0 z-10 bg-black overflow-hidden">
      <img
        src="/boat.webp"
        alt=""
        aria-hidden
        decoding="sync"
        className="absolute pointer-events-none"
        style={{ width: 1, height: 1, opacity: 0, top: 0, left: 0 }}
      />
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
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: descentVisible ? 1 : 0,
          transition: 'opacity 0.25s linear',
        }}
      >
        {ascendStars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.startY}%`,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animation: `ascend-star ${s.duration}s linear ${s.delay}s infinite`,
              boxShadow: `0 0 ${s.size * 3}px rgba(255,255,255,${s.opacity * 0.5})`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ x: '-130vw', y: 0 }}
        animate={{ x: 0, y: shipLifted ? '-115vh' : 0 }}
        transition={{
          x: { duration: 1.2, ease: [0.16, 0.84, 0.32, 1] },
          y: { duration: shipLifted ? 1.0 : 0, ease: 'easeIn' },
        }}
      >
        <div className="relative w-[min(90vw,72rem)] aspect-[16/9]">
          <div
            aria-hidden
            className="absolute -translate-y-1/2 h-[18%] pointer-events-none"
            style={{
              top: '54%',
              left: '-45%',
              width: '50%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(37,99,235,0.1) 45%, rgba(56,189,248,0.3) 100%)',
              filter: 'blur(16px)',
              animation: 'trail-flicker 0.6s ease-in-out infinite',
            }}
          />
          <div
            aria-hidden
            className="absolute -translate-y-1/2 h-[5%] pointer-events-none"
            style={{
              top: '54%',
              left: '-35%',
              width: '40%',
              background:
                'linear-gradient(to right, transparent 0%, rgba(125,211,252,0.35) 55%, rgba(240,249,255,0.7) 100%)',
              filter: 'blur(4px)',
              animation: 'trail-flicker 0.35s ease-in-out infinite',
            }}
          />

          <img
            src="/ship.webp"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
          />

          <AnimatePresence>
            {phase === 'flash' && (
              <motion.div
                key="flash"
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1.2, 1, 0.9] }}
                transition={{ duration: 0.55, times: [0, 0.2, 0.55, 1], ease: 'easeOut' }}
                className="absolute left-1/2 top-[74%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ width: '18%', aspectRatio: '1' }}
              >
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: '32%',
                    aspectRatio: '1',
                    background:
                      'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)',
                    boxShadow:
                      '0 0 18px 4px rgba(255,255,255,0.95), 0 0 36px 8px rgba(255,255,255,0.4)',
                    filter: 'blur(1px)',
                  }}
                />
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
                  style={{
                    height: 1.5,
                    background:
                      'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.9)',
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: 1.5,
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)',
                    boxShadow: '0 0 6px rgba(255,255,255,0.9)',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: descentVisible ? 1 : 0,
          transition: 'opacity 0.25s linear',
        }}
      >
        <div className="relative w-[min(90vw,72rem)] aspect-[16/9]">
          <div className="absolute left-1/2 top-[88%] -translate-x-1/2 -translate-y-1/2">
            <div
              aria-hidden
              className="absolute left-1/2 bottom-full w-[80px] h-[140vh] pointer-events-none"
              style={{
                transformOrigin: 'bottom',
                transform: `translateX(-50%) scaleY(${descentVisible ? 1 : 0})`,
                opacity: descentVisible ? 1 : 0,
                transition: descentVisible
                  ? 'transform 0.6s ease-out 1.0s, opacity 0.6s ease-out 1.0s'
                  : 'transform 0.2s linear, opacity 0.2s linear',
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(210,210,215,0.9) 0%, rgba(160,160,170,0.55) 30%, rgba(120,120,130,0.18) 70%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${palette.glow} 0%, ${palette.trail} 35%, rgba(0,0,0,0) 90%)`,
                  filter: 'blur(10px)',
                  mixBlendMode: 'screen',
                  opacity: descentVisible ? 1 : 0,
                  transition: descentVisible
                    ? 'opacity 0.6s ease-in 1.4s'
                    : 'opacity 0.2s linear',
                }}
              />
            </div>

            <div
              className="relative"
              style={{ animation: 'bob 1.2s ease-in-out infinite' }}
            >
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[210px] h-[210px] pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 62%, rgba(224,242,254,0.9) 0%, rgba(56,189,248,0.65) 18%, rgba(37,99,235,0.35) 38%, transparent 60%)',
                  filter: 'blur(8px)',
                  animation: 'burn-flicker 0.18s ease-in-out infinite alternate',
                }}
              />
              <div
                aria-hidden
                className="absolute left-1/2 top-[92%] -translate-x-1/2 w-[140px] h-[90px] pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at 50% 0%, rgba(240,249,255,0.95) 0%, rgba(56,189,248,0.7) 25%, rgba(37,99,235,0.4) 55%, transparent 80%)',
                  filter: 'blur(5px)',
                  animation: 'burn-flicker 0.12s ease-in-out infinite alternate',
                }}
              />
              <img
                src="/boat.webp"
                alt=""
                draggable={false}
                className="relative w-[170px] h-auto"
                style={{
                  filter:
                    'drop-shadow(0 0 4px rgba(224,242,254,0.9)) drop-shadow(0 0 12px rgba(56,189,248,0.85)) drop-shadow(0 0 24px rgba(37,99,235,0.7))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            key="idle-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: shipEntered ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-6 left-6 z-20">
              <h1 className="text-3xl">{t('pages.cases.title')}</h1>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 pointer-events-auto">
              <div className="px-4 py-2 bg-slate-900/70 backdrop-blur border border-violet-900 rounded-md text-sm">
                <span className="text-slate-400 mr-2">
                  {t('pages.cases.youHaveShort')}
                </span>
                <span className="text-violet-200 font-display text-lg">
                  {count}
                </span>
              </div>
              <button
                type="button"
                disabled={empty}
                onClick={handleOpen}
                className="px-8 py-3 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed rounded-md font-display text-lg uppercase tracking-wider shadow-lg shadow-orange-900/40 transition-colors"
              >
                {t('pages.cases.openButton')}
              </button>
            </div>
            {empty && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-sm text-slate-500">
                {t('pages.cases.noCases')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animating && (
          <motion.button
            key="close"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-label="close"
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xl flex items-center justify-center backdrop-blur"
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(phase === 'whiteflash' || phase === 'reveal') && (
          <motion.div
            key="whiteflash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.45, times: [0, 0.3, 0.6, 1] }}
            className="absolute inset-0 bg-white pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'reveal' && drop && (
          <motion.div
            key="reveal"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 bg-black"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 30% 50%, ${palette.glow} 0%, transparent 55%)`,
                opacity: 0.35,
              }}
            />

            <div className="relative h-full grid grid-cols-1 md:grid-cols-2 gap-8 px-8 md:px-16 py-12">
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, y: 40 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative"
                  style={{ filter: `drop-shadow(0 0 60px ${palette.glow})` }}
                >
                  {drop.skin.idleImage ? (
                    <img
                      src={skinImageSrc(drop.skin.idleImage)}
                      alt={drop.skin.name}
                      className="max-h-[70vh] object-contain"
                    />
                  ) : (
                    <div
                      className={`w-64 h-[28rem] rounded-md border-2 ${palette.ring} flex items-center justify-center text-8xl`}
                      style={{
                        background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
                      }}
                    >
                      ?
                    </div>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col justify-center max-w-lg"
              >
                <div
                  className={`text-sm uppercase tracking-[0.3em] mb-3 ${palette.text}`}
                >
                  {t(`skin.rarity.${drop.skin.rarity}`)}
                </div>
                <h2 className="font-display text-5xl md:text-6xl mb-2 leading-tight">
                  {drop.skin.name}
                </h2>
                <div className="text-violet-300 text-lg mb-6">
                  {t(`skin.figure.${drop.skin.figure}`)}
                </div>
                {drop.skin.description && (
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {drop.skin.description}
                  </p>
                )}
                {drop.isDuplicate && (
                  <div className="text-sm text-slate-500 mb-4">
                    {t('pages.cases.duplicate')}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="self-start mt-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-md font-display uppercase tracking-wider text-sm"
                >
                  {t('pages.cases.continue')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
