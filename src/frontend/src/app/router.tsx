import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './RootLayout'
import { LobbyPage } from '../pages/LobbyPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { GamePage } from '../pages/GamePage'
import { HistoryPage } from '../pages/HistoryPage'
import { ReplayPage } from '../pages/ReplayPage'
import { MyProfilePage } from '../pages/MyProfilePage'
import { UserProfilePage } from '../pages/UserProfilePage'
import { InventoryPage } from '../pages/InventoryPage'
import { CasesPage } from '../pages/CasesPage'
import { FriendsPage } from '../pages/FriendsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LobbyPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:gameId', element: <ReplayPage /> },
      { path: 'profile', element: <MyProfilePage /> },
      { path: 'profile/:userId', element: <UserProfilePage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'friends', element: <FriendsPage /> },
    ],
  },
  { path: '/game/:gameId', element: <GamePage /> },
  { path: '*', element: <NotFoundPage /> },
])
