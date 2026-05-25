import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'

interface Slide {
  id: string
  placeholder: string
}

const SLIDES: Slide[] = [
  { id: 'intro', placeholder: '/onboarding/intro.webp' },
  { id: 'modes', placeholder: '/onboarding/modes.webp' },
  { id: 'matchmaking', placeholder: '/onboarding/matchmaking.webp' },
  { id: 'cases', placeholder: '/onboarding/cases.webp' },
  { id: 'extras', placeholder: '/onboarding/extras.webp' },
]

function Placeholder({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-violet-900/60 bg-slate-900/40">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="text-slate-600 text-sm uppercase tracking-[0.4em]">
          screenshot
        </div>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)

  const total = SLIDES.length
  const slide = SLIDES[index]
  const isLast = index === total - 1

  const finish = () => navigate('/lobby')
  const prev = () => setIndex((i) => Math.max(0, i - 1))
  const next = () => {
    if (isLast) finish()
    else setIndex((i) => i + 1)
  }

  const title = t(`pages.onboarding.${slide.id}.title`)
  const body = t(`pages.onboarding.${slide.id}.body`)

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
                  key={s.id}
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
              key={slide.id}
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
              <Placeholder src={slide.placeholder} alt={title} />
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
