import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { GuestLayout } from './GuestLayout'
import { RootLayout } from './RootLayout'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { LobbyPage } from '../pages/LobbyPage'
import { GamePage } from '../pages/GamePage'
import { HistoryPage } from '../pages/HistoryPage'
import { ReplayPage } from '../pages/ReplayPage'
import { MyProfilePage } from '../pages/MyProfilePage'
import { UserProfilePage } from '../pages/UserProfilePage'
import { InventoryPage } from '../pages/InventoryPage'
import { CasesPage } from '../pages/CasesPage'
import { ShopPage } from '../pages/ShopPage'
import { FriendsPage } from '../pages/FriendsPage'
import { DebugBoardPage } from '../pages/DebugBoardPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  // гостевая зона: лендинг, login, register
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        element: <GuestLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  // приватная зона: основные страницы под RootLayout, плюс GamePage без хедера
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: '/lobby', element: <LobbyPage /> },
          { path: '/inventory', element: <InventoryPage /> },
          { path: '/cases', element: <CasesPage /> },
          { path: '/shop', element: <ShopPage /> },
          { path: '/friends', element: <FriendsPage /> },
          { path: '/history', element: <HistoryPage /> },
          { path: '/history/:gameId', element: <ReplayPage /> },
          { path: '/profile', element: <MyProfilePage /> },
          { path: '/profile/:userId', element: <UserProfilePage /> },
          { path: '/debug/board', element: <DebugBoardPage /> },
        ],
      },
      { path: '/game/:gameId', element: <GamePage /> },
    ],
  },
  // 404 — без обёрток
  { path: '*', element: <NotFoundPage /> },
])
