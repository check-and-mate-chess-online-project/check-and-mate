import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Guid } from '../api'
import { FigureType } from '../api/enums'

export type Side = 'white' | 'black'

export interface FightPiece {
  figure: FigureType
  color: Side
}

interface Props {
  attacker: FightPiece
  victim: FightPiece
  attackerSkinId?: Guid
  victimSkinId?: Guid
  onComplete: () => void
}

type Phase = 'intro' | 'clash' | 'end'

function poseUrl(skinId: Guid | undefined, pose: string): string | undefined {
  if (!skinId) return undefined
  return `/skins/${skinId}/${pose}.webp`
}

function Portrait({
  skinId,
  side,
  pose,
}: {
  skinId: Guid | undefined
  side: Side
  pose: 'idle' | 'win' | 'lose'
}) {
  const poseFile =
    pose === 'idle'
      ? 'idle'
      : pose === 'win'
        ? 'end-fight-win'
        : 'end-fight-lose'
  const src = poseUrl(skinId, poseFile)
  const fallback = poseUrl(skinId, 'idle')
  const [errored, setErrored] = useState(false)
  const effective = errored ? fallback : src
  if (!effective) {
    return (
      <div
        className={`h-full w-full flex items-center justify-center text-6xl ${
          side === 'black' ? 'text-slate-700' : 'text-slate-300'
        }`}
      >
        ?
      </div>
    )
  }
  return (
    <img
      src={effective}
      alt=""
      onError={() => setErrored(true)}
      className="h-full w-full object-contain"
      style={{
        filter: side === 'black' ? 'brightness(0.55) saturate(0.6)' : undefined,
      }}
      draggable={false}
    />
  )
}

export function FightAnimation({
  attacker,
  victim,
  attackerSkinId,
  victimSkinId,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>('intro')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('clash'), 600)
    const t2 = setTimeout(() => setPhase('end'), 1100)
    const t3 = setTimeout(() => onComplete(), 2800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="fixed right-6 top-28 z-30 bg-slate-950/90 border border-violet-900 rounded-lg overflow-hidden shadow-2xl"
      style={{ width: '800px', height: '600px' }}
    >
      <motion.div
        animate={
          phase === 'clash'
            ? { x: [0, -6, 6, -4, 4, 0], y: [0, 4, -4, 3, -3, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.5 }}
        className="relative h-full w-full"
      >
        <AnimatePresence>
          {phase === 'intro' && (
            <>
              <motion.div
                key="atk-intro"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '0%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-y-0 left-0 w-1/2"
              >
                <Portrait skinId={attackerSkinId} side={attacker.color} pose="idle" />
              </motion.div>
              <motion.div
                key="vct-intro"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: '0%', opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-y-0 right-0 w-1/2"
              >
                <Portrait skinId={victimSkinId} side={victim.color} pose="idle" />
              </motion.div>
            </>
          )}

          {phase === 'clash' && (
            <>
              <div className="absolute inset-y-0 left-0 w-1/2">
                <Portrait skinId={attackerSkinId} side={attacker.color} pose="idle" />
              </div>
              <div className="absolute inset-y-0 right-0 w-1/2">
                <Portrait skinId={victimSkinId} side={victim.color} pose="idle" />
              </div>
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, times: [0, 0.3, 1] }}
                className="absolute inset-0 bg-orange-300 mix-blend-screen pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-orange-200"
                style={{ textShadow: '0 0 20px rgba(255,140,0,0.8)' }}
              >
                ⚔
              </motion.div>
            </>
          )}

          {phase === 'end' && (
            <>
              <motion.div
                key="winner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-y-0 left-0 right-0 mx-auto w-3/4"
              >
                <Portrait skinId={attackerSkinId} side={attacker.color} pose="win" />
              </motion.div>
              <motion.div
                key="loser"
                initial={{ rotate: 0, opacity: 1, x: 0 }}
                animate={{ rotate: 90, opacity: 0.4, x: 40, y: 60 }}
                transition={{ duration: 0.6 }}
                className="absolute bottom-2 right-2 w-1/3"
              >
                <Portrait skinId={victimSkinId} side={victim.color} pose="lose" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
