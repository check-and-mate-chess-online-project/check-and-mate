import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { t } = useTranslation()
  const game = useMemo(() => new Chess(), [])
  const [fen, setFen] = useState(game.fen())

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
    return true
  }

  const reset = () => {
    game.reset()
    setFen(game.fen())
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
        <Link to="/lobby" className="text-slate-400 hover:text-slate-100 text-sm">
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
        <div className="w-full max-w-xl">
          <Chessboard options={{ position: fen, onPieceDrop }} />
        </div>
      </main>
    </div>
  )
}
