import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FigureType } from '../api/enums'
import { skinImageSrc } from '../lib/skinImage'

export type Side = 'white' | 'black'

export interface FightPiece {
  figure: FigureType
  color: Side
}

interface Props {
  attacker: FightPiece
  victim: FightPiece
  attackerStartImage?: string
  victimStartImage?: string
  attackerEndImage?: string
  victimEndImage?: string
  onComplete: () => void
}

type Phase = 'start' | 'fight' | 'end'

const TIMINGS = {
  start: 900,
  fight: 1200,
  end: 2500,
}

const FIGHT_FRAMES = [
  '/fight/fight-1.png',
  '/fight/fight-2.png',
  '/fight/fight-3.png',
  '/fight/fight-4.png',
  '/fight/fight-5.png',
  '/fight/fight-6.png',
]
const FIGHT_TEXT_URL = '/fight-text.webp'
const FIGHT_FRAME_MS = 70

interface PoseImgProps {
  src: string | undefined
  className?: string
  style?: React.CSSProperties
}

function PoseImg({ src, className, style }: PoseImgProps) {
  const [erroredSrc, setErroredSrc] = useState<string | undefined>(undefined)
  if (!src || erroredSrc === src) return null
  return (
    <img
      src={src}
      alt=""
      onError={() => setErroredSrc(src)}
      draggable={false}
      className={className}
      style={style}
    />
  )
}

export function FightAnimation({
  attackerStartImage,
  victimStartImage,
  attackerEndImage,
  victimEndImage,
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
      setFrameIdx((current) => {
        let next = Math.floor(Math.random() * FIGHT_FRAMES.length)
        if (next === current) next = (next + 1) % FIGHT_FRAMES.length
        return next
      })
    }, FIGHT_FRAME_MS)
    return () => clearInterval(id)
  }, [phase])

  const startWin = skinImageSrc(attackerStartImage) || undefined
  const startLose = skinImageSrc(victimStartImage) || undefined
  const endWin = skinImageSrc(attackerEndImage) || undefined
  const endLose = skinImageSrc(victimEndImage) || undefined

  return (
    <div className="fixed right-4 top-0 bottom-0 z-30 flex items-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
        transition={{ duration: 0.3 }}
        className="relative aspect-[4/3] bg-slate-950/85 border border-violet-900 rounded-lg overflow-hidden shadow-2xl pointer-events-auto"
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
            <motion.img
              src={FIGHT_TEXT_URL}
              alt=""
              draggable={false}
              initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
              animate={{
                scale: [0.4, 1.2, 1],
                opacity: [0, 1, 1],
                rotate: [-10, 5, 0],
              }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="absolute inset-0 m-auto z-10 pointer-events-none object-contain"
              style={{ maxHeight: '60%', maxWidth: '85%' }}
            />
          </>
        )}

        {phase === 'fight' &&
          FIGHT_FRAMES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ visibility: i === frameIdx ? 'visible' : 'hidden' }}
            />
          ))}

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
    </div>
  )
}
