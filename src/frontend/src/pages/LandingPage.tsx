import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import logo from '../assets/logo.svg'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

interface FeatureCardProps {
  icon: string
  title: string
  body: string
  delay: number
  accent: string
}

function FeatureCard({ icon, title, body, delay, accent }: FeatureCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className="rounded-xl border border-violet-900/60 bg-slate-950/50 backdrop-blur p-7"
    >
      <div
        className="font-display text-4xl mb-4"
        style={{
          color: accent,
          textShadow: `0 0 18px ${accent}aa`,
        }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
    </motion.div>
  )
}

function SectionDivider() {
  return (
    <div className="relative max-w-3xl mx-auto px-6">
      <div className="h-px bg-violet-600/40" />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400"
      />
    </div>
  )
}

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center px-6 pt-4 pb-16">
        <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col items-start"
          >
            <img
              src={logo}
              alt="Check & Mate"
              className="w-full max-w-md mb-6"
              draggable={false}
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-xl text-violet-200 mb-3"
            >
              {t('landing.tagline')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="text-base text-slate-400 max-w-md leading-relaxed mb-8"
            >
              {t('landing.subtitle')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="px-7 py-3 rounded-md font-display uppercase tracking-[0.18em] text-sm text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 active:translate-y-px transition-colors"
              >
                {t('landing.startPlaying')}
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-md font-display uppercase tracking-[0.18em] text-sm text-violet-50 bg-violet-900/40 hover:bg-violet-800/60 border border-violet-500/40 hover:border-violet-400/60 transition-colors"
              >
                {t('landing.signIn')}
              </Link>
            </motion.div>
          </motion.div>

          <div className="hidden lg:flex items-center justify-center" aria-hidden>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              style={{
                width: 'min(34rem, 100%)',
                aspectRatio: '1',
                backgroundImage: 'url(/planets/earth_big.webp)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                animation: 'planet-rotate 240s linear infinite',
              }}
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-sm uppercase tracking-[0.4em] text-violet-400 text-center mb-12"
          >
            {t('landing.features.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon="♚"
              title={t('landing.features.play.title')}
              body={t('landing.features.play.body')}
              accent="rgba(167,139,250,0.9)"
              delay={0}
            />
            <FeatureCard
              icon="⬢"
              title={t('landing.features.cases.title')}
              body={t('landing.features.cases.body')}
              accent="rgba(167,139,250,0.9)"
              delay={0.12}
            />
            <FeatureCard
              icon="◉"
              title={t('landing.features.planets.title')}
              body={t('landing.features.planets.body')}
              accent="rgba(56,189,248,0.9)"
              delay={0.24}
            />
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="relative px-6 pt-24 pb-0 overflow-hidden">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-slate-100">
            {t('landing.cta.title')}
          </h2>
          <p className="text-slate-400 mb-9 text-lg leading-relaxed">
            {t('landing.cta.body')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-md font-display uppercase tracking-[0.18em] text-base text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 active:translate-y-px transition-colors"
            >
              {t('landing.cta.primary')}
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 rounded-md font-display uppercase tracking-[0.18em] text-base text-violet-200 hover:text-violet-100 underline-offset-4 hover:underline transition-colors"
            >
              {t('landing.cta.secondary')}
            </Link>
          </div>
        </motion.div>

        <img
          src="/durov-bottom.webp"
          alt=""
          aria-hidden
          draggable={false}
          className="absolute right-0 bottom-0 w-[min(48vw,720px)] h-auto pointer-events-none select-none"
          style={{ imageRendering: 'auto' }}
        />
      </section>
    </div>
  )
}
