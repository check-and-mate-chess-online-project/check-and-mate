import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-slate-400 mb-4">page not found</p>
        <Link to="/" className="text-blue-400 hover:underline">
          go home
        </Link>
      </div>
    </div>
  )
}
