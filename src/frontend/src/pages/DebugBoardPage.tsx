import { useState } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from '../shared/ui/Chessboard/Chessboard'
import { useEquippedSkinsStore } from '../shared/lib/equippedSkins'

export function DebugBoardPage() {
  const [game] = useState(() => new Chess())
  const equipped = useEquippedSkinsStore((s) => s.equipped)

  return (
    <div className="min-h-screen text-slate-100 p-6">
      <h1 className="text-2xl mb-2">Debug board</h1>
      <p className="text-slate-400 mb-4 text-sm">
        equipped: {JSON.stringify(equipped)}
      </p>
      <div className="max-w-xl">
        <Chessboard
          options={{
            position: game.fen(),
            boardOrientation: 'white',
            boardStyle: { borderRadius: '12px' },
            darkSquareStyle: { backgroundColor: '#4c1d95' },
            lightSquareStyle: { backgroundColor: '#e5e7eb' },
          }}
        />
      </div>
    </div>
  )
}
