import { Link, Outlet } from 'react-router-dom'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4">
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            Check &amp; Mate
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link to="/" className="hover:text-slate-100">Lobby</Link>
            <Link to="/login" className="hover:text-slate-100">Login</Link>
            <Link to="/game/demo" className="hover:text-slate-100">Game (demo)</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
