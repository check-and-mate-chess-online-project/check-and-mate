import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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

type Phase = 'start' | 'fight' | 'end'

const TIMINGS = {
  start: 900,
  fight: 1400,
  end: 1500,
}

const FIGHT_FRAMES = [
  '/skins/fight-1.webp',
  '/skins/fight-2.webp',
  '/skins/fight-3.webp',
  '/skins/fight-4.webp',
]
const FIGHT_FRAME_MS = 180

function poseUrl(skinId: Guid | undefined, pose: string): string | undefined {
  if (!skinId) return undefined
  return `/skins/${skinId}/${pose}.webp`
}

interface PoseImgProps {
  src: string | undefined
  className?: string
  style?: React.CSSProperties
}

function PoseImg({ src, className, style }: PoseImgProps) {
  const [errored, setErrored] = useState(false)
  if (!src || errored) return null
  return (
    <img
      src={src}
      alt=""
      onError={() => setErrored(true)}
      draggable={false}
      className={className}
      style={style}
    />
  )
}

export function FightAnimation({
  attackerSkinId,
  victimSkinId,
  onComplete,
}: Props) {
  const [phase, setPhase] = useState<Phase>('start')
  const [frameIdx, setFrameIdx] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  })

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fight'), TIMINGS.start)
    const t2 = setTimeout(
      () => setPhase('end'),
      TIMINGS.start + TIMINGS.fight,
    )
    const t3 = setTimeout(
      () => onCompleteRef.current(),
      TIMINGS.start + TIMINGS.fight + TIMINGS.end,
    )
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'fight') return
    const id = setInterval(() => {
      setFrameIdx((i) => (i + 1) % FIGHT_FRAMES.length)
    }, FIGHT_FRAME_MS)
    return () => clearInterval(id)
  }, [phase])

  const startWin = poseUrl(attackerSkinId, 'start-fight-win')
  const startLose = poseUrl(victimSkinId, 'start-fight-lose')
  const endWin = poseUrl(attackerSkinId, 'end-fight-win')
  const endLose = poseUrl(victimSkinId, 'end-fight-lose')

  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
      transition={{ duration: 0.3 }}
      className="fixed right-4 top-28 z-30 aspect-[4/3] bg-slate-950/85 border border-violet-900 rounded-lg overflow-hidden shadow-2xl"
      style={{ width: 'clamp(280px, calc(50vw - 344px), 800px)' }}
    >
      {phase === 'start' && (
        <>
          <motion.div
            initial={{ x: '-30%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            <PoseImg
              src={startWin}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </motion.div>
          <motion.div
            initial={{ x: '30%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0"
          >
            <PoseImg
              src={startLose}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </motion.div>
        </>
      )}

      {phase === 'fight' && (
        <PoseImg
          src={FIGHT_FRAMES[frameIdx]}
          className="absolute inset-0 w-full h-full object-contain"
        />
      )}

      {phase === 'end' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <PoseImg
            src={endLose}
            className="absolute inset-0 w-full h-full object-contain"
          />
          <PoseImg
            src={endWin}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </motion.div>
      )}
    </motion.div>
  )
}
