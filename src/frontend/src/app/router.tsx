import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { LobbyPage } from '../pages/LobbyPage'
import { LoginPage } from '../pages/LoginPage'
import { GamePage } from '../pages/GamePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <LobbyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'game/:gameId', element: <GamePage /> },
    ],
  },
])
