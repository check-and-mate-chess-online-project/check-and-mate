import { useParams } from 'react-router-dom'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Game</h1>
      <p className="text-slate-400">id: {gameId}</p>
    </div>
  )
}
