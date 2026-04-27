import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="text-center max-w-2xl">
      <h1 className="text-6xl font-bold mb-4">Check &amp; Mate</h1>
      <p className="text-xl text-slate-400 mb-8">
        шахматы со скинами из кейсов
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-medium"
        >
          Войти
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-md font-medium"
        >
          Регистрация
        </Link>
      </div>
    </div>
  )
}
