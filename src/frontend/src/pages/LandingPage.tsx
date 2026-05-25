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
      className="relative rounded-xl border border-violet-900/60 bg-slate-950/50 backdrop-blur p-7 overflow-hidden group"
    >
      <div
        aria-hidden
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${accent} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />
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

export function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 pt-8 pb-16 overflow-hidden">
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute pointer-events-none"
          style={{
            right: '-12vw',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(70vw, 55rem)',
            aspectRatio: '1',
            backgroundImage: 'url(/planets/earth_big.webp)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0 0 60px rgba(56,189,248,0.25))',
            animation: 'planet-rotate 240s linear infinite',
            opacity: 0.85,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 70% 50%, rgba(56,189,248,0.18) 0%, transparent 55%), radial-gradient(ellipse at 10% 30%, rgba(167,139,250,0.22) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <img
              src={logo}
              alt="Check &amp; Mate"
              className="w-full max-w-2xl mb-8"
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="text-2xl text-violet-200 mb-3"
            >
              {t('landing.tagline')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
              className="text-base text-slate-400 max-w-xl leading-relaxed mb-10"
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
                className="px-7 py-3 rounded-md font-display uppercase tracking-[0.18em] text-sm text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 shadow-[0_4px_22px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_4px_30px_rgba(251,146,60,0.62),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-px transition-all"
              >
                {t('landing.startPlaying')}
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-md font-display uppercase tracking-[0.18em] text-sm text-violet-50 bg-violet-900/40 hover:bg-violet-800/60 border border-violet-500/40 hover:border-violet-400/60 transition-all"
              >
                {t('landing.signIn')}
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            className="hidden lg:flex relative items-end justify-center"
          >
            <div
              aria-hidden
              className="absolute -inset-4 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(167,139,250,0.32) 0%, transparent 65%)',
                filter: 'blur(30px)',
              }}
            />
            <motion.img
              src="/skins/gagarin-king-idle.webp"
              alt=""
              draggable={false}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-[440px] w-auto object-contain z-10"
              style={{
                filter:
                  'drop-shadow(0 0 25px rgba(167,139,250,0.55)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
              }}
            />
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.4em] text-slate-500"
        >
          ↓
        </motion.div>
      </section>

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
              accent="rgba(167,139,250,0.7)"
              delay={0}
            />
            <FeatureCard
              icon="◈"
              title={t('landing.features.cases.title')}
              body={t('landing.features.cases.body')}
              accent="rgba(251,146,60,0.7)"
              delay={0.12}
            />
            <FeatureCard
              icon="◉"
              title={t('landing.features.planets.title')}
              body={t('landing.features.planets.body')}
              accent="rgba(56,189,248,0.7)"
              delay={0.24}
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-24 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            left: '-15vw',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(60vw, 40rem)',
            aspectRatio: '1',
            backgroundImage: 'url(/planets/mars_big.webp)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'drop-shadow(0 0 50px rgba(251,146,60,0.2))',
            opacity: 0.5,
            animation: 'planet-rotate 320s linear infinite reverse',
          }}
        />
        <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex items-end justify-center"
          >
            <div
              aria-hidden
              className="absolute -inset-8 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(251,146,60,0.28) 0%, transparent 65%)',
                filter: 'blur(28px)',
              }}
            />
            <motion.img
              src="/skins/magnus-pawn/idle.webp"
              alt=""
              draggable={false}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-[420px] w-auto object-contain z-10"
              style={{
                filter:
                  'drop-shadow(0 0 25px rgba(251,146,60,0.45)) drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
              }}
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          >
            <div className="text-xs uppercase tracking-[0.4em] text-violet-400 mb-3">
              {t('landing.showcase.tagline')}
            </div>
            <h2 className="font-display text-5xl md:text-6xl mb-5 text-slate-100">
              {t('landing.showcase.name')}
            </h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              {t('landing.showcase.lore')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 relative">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.18) 0%, transparent 60%)',
          }}
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-2xl mx-auto text-center"
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
              className="px-8 py-3.5 rounded-md font-display uppercase tracking-[0.18em] text-base text-orange-50 bg-gradient-to-b from-orange-500 to-orange-700 hover:from-orange-400 hover:to-orange-600 border border-orange-300/40 shadow-[0_4px_22px_rgba(251,146,60,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] hover:shadow-[0_4px_30px_rgba(251,146,60,0.62),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-px transition-all"
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
      </section>
    </div>
  )
}
