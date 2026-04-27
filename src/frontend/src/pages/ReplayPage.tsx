import { useParams } from 'react-router-dom'

export function ReplayPage() {
  const { gameId } = useParams<{ gameId: string }>()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Replay</h1>
      <p className="text-slate-400">replay партии: {gameId}</p>
    </div>
  )
}
