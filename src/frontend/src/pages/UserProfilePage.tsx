import { useParams } from 'react-router-dom'

export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">User profile</h1>
      <p className="text-slate-400">профиль игрока: {userId}</p>
    </div>
  )
}
