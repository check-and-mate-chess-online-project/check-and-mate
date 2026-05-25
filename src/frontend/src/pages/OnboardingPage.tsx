import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '../shared/auth/authStore'

type SlideId = 'intro' | 'modes' | 'matchmaking' | 'cases' | 'extras'

const SLIDES: SlideId[] = [
  'intro',
  'modes',
  'matchmaking',
  'cases',
  'extras',
]

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-violet-900/60 bg-slate-900/40">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(56,189,248,0.12) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

function IntroIllustration() {
  return (
    <Frame>
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => {
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
      <div
        className="absolute"
        style={{
          right: '-8%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '60%',
          aspectRatio: '1',
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(251,146,60,0.55) 0%, rgba(167,139,250,0.4) 45%, rgba(15,23,42,0.95) 80%)',
          boxShadow:
            '0 0 60px rgba(167,139,250,0.4), inset -20px -20px 60px rgba(0,0,0,0.5)',
        }}
      />
      <div
        className="absolute"
        style={{
          right: '-20%',
          top: '50%',
          transform: 'translateY(-50%) rotateX(70deg)',
          width: '120%',
          aspectRatio: '4',
          borderRadius: '50%',
          border: '2px solid rgba(167,139,250,0.35)',
          opacity: 0.6,
        }}
      />
      <div
        className="absolute left-[12%] top-1/2 -translate-y-1/2 font-display select-none"
        style={{
          fontSize: 'clamp(80px, 14vw, 180px)',
          lineHeight: 1,
          color: '#f5f3ff',
          textShadow:
            '0 0 30px rgba(167,139,250,0.85), 0 0 60px rgba(167,139,250,0.45)',
        }}
      >
        ♚
      </div>
      <div
        className="absolute left-[8%] bottom-[18%] font-display tracking-[0.4em] uppercase text-xs"
        style={{ color: 'rgba(167,139,250,0.85)' }}
      >
        check &amp; mate
      </div>
    </Frame>
  )
}

function ModesIllustration() {
  const modes = [
    { name: 'Bullet', tc: '2+1', accent: 'rgba(248,113,113,0.9)' },
    { name: 'Blitz', tc: '3+2', accent: 'rgba(251,146,60,0.9)' },
    { name: 'Rapid', tc: '15+10', accent: 'rgba(56,189,248,0.9)' },
  ]
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center px-6 gap-3">
        {modes.map((m) => (
          <div
            key={m.name}
            className="flex-1 rounded-lg border bg-slate-950/70 backdrop-blur p-3 flex flex-col items-center gap-1.5"
            style={{
              borderColor: m.accent.replace('0.9', '0.4'),
              boxShadow: `0 0 22px ${m.accent.replace('0.9', '0.18')}`,
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: m.accent }}
            >
              {m.name}
            </div>
            <div
              className="font-display text-2xl md:text-3xl tabular-nums text-slate-100"
              style={{ textShadow: `0 0 14px ${m.accent}` }}
            >
              {m.tc}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span>min</span>
              <span className="opacity-50">+</span>
              <span>sec/move</span>
            </div>
          </div>
        ))}
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
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px"
            style={{
              background:
                'linear-gradient(to right, rgba(167,139,250,0.1) 0%, rgba(167,139,250,0.7) 50%, rgba(167,139,250,0.1) 100%)',
            }}
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
            style={{ boxShadow: '0 0 20px rgba(100,116,139,0.2)' }}
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
              background:
                'radial-gradient(circle at 30% 30%, rgba(251,146,60,0.6) 0%, rgba(180,83,9,0.3) 65%, transparent 100%)',
              border: '1px solid rgba(251,146,60,0.5)',
              color: '#e8a763',
              textShadow: '0 0 10px rgba(232,167,99,0.7)',
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
          <div
            className="w-16 h-16 rounded-md flex items-center justify-center font-display text-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(167,139,250,0.35) 0%, rgba(76,29,149,0.6) 100%)',
              border: '1px solid rgba(167,139,250,0.6)',
              boxShadow: '0 0 22px rgba(167,139,250,0.4)',
              color: '#f5f3ff',
            }}
          >
            ⬢
          </div>
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

function ExtrasIllustration() {
  return (
    <Frame>
      <div className="absolute inset-0 grid grid-cols-2 gap-3 p-4">
        <div className="rounded-md border border-violet-900/60 bg-slate-950/60 p-3 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
            friends
          </div>
          {['ali', 'kira', 'nova'].map((n, i) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium"
                style={{
                  background:
                    i === 0
                      ? 'rgba(56,189,248,0.25)'
                      : i === 1
                        ? 'rgba(251,146,60,0.25)'
                        : 'rgba(167,139,250,0.25)',
                  border:
                    i === 0
                      ? '1px solid rgba(56,189,248,0.5)'
                      : i === 1
                        ? '1px solid rgba(251,146,60,0.5)'
                        : '1px solid rgba(167,139,250,0.5)',
                  color: '#f5f3ff',
                }}
              >
                {n[0].toUpperCase()}
              </div>
              <div className="text-xs text-slate-200 flex-1">{n}</div>
              {i === 0 && (
                <div className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-violet-500/50 text-violet-200">
                  invite
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-md border border-violet-900/60 bg-slate-950/60 p-3 flex flex-col gap-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
            history
          </div>
          {[
            { res: 'W', color: 'rgba(74,222,128,0.9)' },
            { res: 'L', color: 'rgba(248,113,113,0.9)' },
            { res: 'W', color: 'rgba(74,222,128,0.9)' },
          ].map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-sm flex items-center justify-center text-[11px] font-bold"
                style={{
                  background: g.color.replace('0.9', '0.2'),
                  border: `1px solid ${g.color.replace('0.9', '0.5')}`,
                  color: g.color,
                }}
              >
                {g.res}
              </div>
              <div className="text-xs text-slate-300 flex-1">vs player{i + 1}</div>
              <div className="text-[10px] text-slate-500">▶</div>
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
    case 'extras':
      return <ExtrasIllustration />
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.18) 0%, transparent 55%), radial-gradient(ellipse at 30% 100%, rgba(56,189,248,0.12) 0%, transparent 55%)',
        }}
      />
      <div className="relative w-full max-w-4xl">
        <button
          type="button"
          onClick={finish}
          aria-label={t('pages.onboarding.close')}
          className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-500 text-xl flex items-center justify-center shadow-lg transition-colors"
        >
          ×
        </button>

        <div className="rounded-xl border border-violet-900/60 bg-slate-950/90 backdrop-blur p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
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
