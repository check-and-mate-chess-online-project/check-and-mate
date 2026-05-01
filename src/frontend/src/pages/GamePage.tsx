import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { formatClock, useChessClock } from '../shared/lib/useChessClock'

const INITIAL_MS = 5 * 60 * 1000
const INCREMENT_MS = 3 * 1000

interface ClockProps {
  label: string
  ms: number
  active: boolean
}

function Clock({ label, ms, active }: ClockProps) {
  const lowTime = ms < 30_000
  return (
    <div
      className={`px-4 py-2 rounded-md border ${
        active ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800'
      }`}
    >
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div
        className={`text-2xl font-mono tabular-nums ${
          lowTime ? 'text-red-400' : 'text-slate-100'
        }`}
      >
        {formatClock(ms)}
      </div>
    </div>
  )
}

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const game = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(game.fen())
  const clock = useChessClock(INITIAL_MS, INCREMENT_MS)

  const onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string
    targetSquare: string | null
  }) => {
    if (!targetSquare) return false
    try {
      game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
    } catch {
      return false
    }
    setFen(game.fen())
    clock.switchTo(game.turn() === 'w' ? 'white' : 'black')
    return true
  }

  const reset = () => {
    game.reset()
    setFen(game.fen())
    clock.reset()
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
        <Link
          to="/lobby"
          className="text-slate-400 hover:text-slate-100 text-sm"
        >
          ← {t('nav.lobby')}
        </Link>
        <span className="text-sm text-slate-500">id: {gameId}</span>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-slate-400 hover:text-slate-100"
        >
          reset
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl flex flex-col gap-3">
          <Clock label="black" ms={clock.blackMs} active={clock.active === 'black'} />
          <Chessboard options={{ position: fen, onPieceDrop }} />
          <Clock label="white" ms={clock.whiteMs} active={clock.active === 'white'} />
        </div>
      </main>
    </div>
  )
}
