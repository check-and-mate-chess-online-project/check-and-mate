import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '../shared/auth/authStore'
import logo from '../assets/logo.svg'

type SlideId = 'intro' | 'modes' | 'matchmaking' | 'cases'

const SLIDES: SlideId[] = ['intro', 'modes', 'matchmaking', 'cases']

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-violet-900/60 bg-black">
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

function IntroIllustration() {
  return (
    <Frame>
      <div className="absolute inset-0">
        {Array.from({ length: 32 }).map((_, i) => {
          const left = (i * 37) % 100
          const top = (i * 53) % 100
          const size = 1 + (i % 3)
          return (
            <div
              key={i}
              className="absolute rounded-full bg-violet-100/70"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: '0 0 6px rgba(167,139,250,0.6)',
              }}
            />
          )
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <img
          src={logo}
          alt="Check & Mate"
          draggable={false}
          className="w-full max-w-[80%] h-auto"
          style={{
            filter:
              'drop-shadow(0 0 24px rgba(167,139,250,0.5)) drop-shadow(0 0 48px rgba(167,139,250,0.25))',
          }}
        />
      </div>
    </Frame>
  )
}

function ModesIllustration() {
  const modes = [
    { name: 'Bullet', tc: '2+1', icon: '⚡' },
    { name: 'Blitz', tc: '3+2', icon: '⚔' },
    { name: 'Rapid', tc: '15+10', icon: '◷' },
  ]
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center gap-2 px-3">
        {modes.map((m, i) => {
          const active = i === 1
          return (
            <div
              key={m.name}
              className={`flex-1 rounded-xl border px-2 py-3 text-center flex flex-col items-center ${
                active
                  ? 'border-violet-400 bg-violet-500/15 text-slate-100 shadow-[0_0_24px_rgba(167,139,250,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300'
              }`}
            >
              <div
                className={
                  active
                    ? 'text-2xl mb-1 text-violet-300'
                    : 'text-2xl mb-1 text-slate-500'
                }
              >
                {m.icon}
              </div>
              <div className="text-sm font-semibold leading-tight">
                {m.name}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                {m.tc}
              </div>
            </div>
          )
        })}
      </div>
    </Frame>
  )
}

function MatchmakingIllustration() {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-between px-8">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full bg-slate-950/80 border border-violet-500/60 flex items-center justify-center font-display text-3xl text-violet-200"
            style={{ boxShadow: '0 0 20px rgba(167,139,250,0.35)' }}
          >
            ♔
          </div>
          <div className="text-[11px] text-slate-300 font-medium">you</div>
          <div className="text-sm tabular-nums text-slate-100 flex items-center gap-1">
            500
            <span style={{ color: '#f87171' }}>★</span>
          </div>
        </div>

        <div className="flex-1 mx-6 relative h-10 flex items-center">
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-violet-500/30"
          />
          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
            <div
              className="w-9 h-9 rounded-full border-2 border-violet-400 border-t-transparent animate-spin"
              style={{ animationDuration: '1.6s' }}
            />
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300">
              ±200
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-full bg-slate-950/80 border border-dashed border-slate-600 flex items-center justify-center font-display text-3xl text-slate-500"
          >
            ?
          </div>
          <div className="text-[11px] text-slate-500 font-medium">opponent</div>
          <div className="text-sm tabular-nums text-slate-400 flex items-center gap-1">
            300–700
            <span style={{ color: '#f87171', opacity: 0.6 }}>★</span>
          </div>
        </div>
      </div>
    </Frame>
  )
}

function CasesIllustration() {
  const rarities = [
    { name: 'common', pct: '50%', color: 'rgba(148,163,184,0.95)' },
    { name: 'rare', pct: '30%', color: 'rgba(56,189,248,0.95)' },
    { name: 'legendary', pct: '20%', color: 'rgba(251,146,60,0.95)' },
  ]
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
        <div className="flex flex-col items-center gap-1">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{
              border: '1px solid rgba(251,146,60,0.5)',
              color: '#e8a763',
              textShadow: '0 0 10px rgba(232,167,99,0.7)',
              boxShadow: '0 0 14px rgba(232,167,99,0.3)',
            }}
          >
            ◈
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            100
          </div>
        </div>

        <div className="text-violet-400 text-xl">→</div>

        <div className="flex flex-col items-center gap-1">
          <img
            src="/boat.webp"
            alt=""
            draggable={false}
            className="w-20 h-20 object-contain"
            style={{
              filter:
                'drop-shadow(0 0 10px rgba(167,139,250,0.5)) drop-shadow(0 0 18px rgba(56,189,248,0.3))',
            }}
          />
          <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300">
            lootbox
          </div>
        </div>

        <div className="text-violet-400 text-xl">→</div>

        <div className="flex flex-col gap-1.5 min-w-[140px]">
          {rarities.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 px-2 py-1 rounded border bg-slate-950/60"
              style={{ borderColor: r.color.replace('0.95', '0.4') }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}`,
                }}
              />
              <div
                className="text-[10px] uppercase tracking-[0.2em] flex-1"
                style={{ color: r.color }}
              >
                {r.name}
              </div>
              <div className="text-[10px] tabular-nums text-slate-400">
                {r.pct}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Illustration({ id }: { id: SlideId }) {
  switch (id) {
    case 'intro':
      return <IntroIllustration />
    case 'modes':
      return <ModesIllustration />
    case 'matchmaking':
      return <MatchmakingIllustration />
    case 'cases':
      return <CasesIllustration />
  }
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  const total = SLIDES.length
  const slide = SLIDES[index]
  const isLast = index === total - 1

  const finish = () => {
    useAuthStore.getState().setPendingOnboarding(false)
    navigate('/lobby')
  }
  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => {
    if (isLast) finish()
    else setIndex((i) => i + 1)
  }

  const title = t(`pages.onboarding.${slide}.title`)
  const body = t(`pages.onboarding.${slide}.body`)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
      <div className="relative w-full max-w-4xl">
        <button
          type="button"
          onClick={finish}
          aria-label={t('pages.onboarding.close')}
          className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-500 text-xl flex items-center justify-center shadow-lg transition-colors"
        >
          ×
        </button>

        <div className="rounded-xl border border-violet-900/60 bg-slate-950/95 p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-6">
            <div className="text-xs uppercase tracking-[0.4em] text-violet-400">
              {t('pages.onboarding.stepLabel', {
                current: index + 1,
                total,
              })}
            </div>
            <div className="flex gap-1.5">
              {SLIDES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`slide ${i + 1}`}
                  className={
                    i === index
                      ? 'w-8 h-1.5 rounded-full bg-violet-400 transition-all'
                      : i < index
                        ? 'w-4 h-1.5 rounded-full bg-violet-700 transition-all'
                        : 'w-4 h-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition-all'
                  }
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 items-center"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl mb-4 text-slate-100 leading-tight">
                  {title}
                </h2>
                <p className="text-base text-slate-300 leading-relaxed whitespace-pre-line">
                  {body}
                </p>
              </div>
              <Illustration id={slide} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="px-5 py-2.5 rounded-md font-display uppercase tracking-[0.18em] text-sm text-slate-300 hover:text-slate-100 border border-slate-700 hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-300 disabled:hover:border-slate-700 transition-colors"
            >
              ← {t('pages.onboarding.prev')}
            </button>
            <button
              type="button"
              onClick={finish}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t('pages.onboarding.skip')}
            </button>
            <button
              type="button"
              onClick={next}
              className={
                isLast
                  ? 'px-5 py-2.5 rounded-md font-display uppercase tracking-[0.18em] text-sm text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 shadow-[0_4px_22px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all'
                  : 'px-5 py-2.5 rounded-md font-display uppercase tracking-[0.18em] text-sm text-violet-50 bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600 border border-violet-300/40 shadow-[0_4px_22px_rgba(167,139,250,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all'
              }
            >
              {isLast
                ? t('pages.onboarding.finish')
                : t('pages.onboarding.next')}{' '}
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
