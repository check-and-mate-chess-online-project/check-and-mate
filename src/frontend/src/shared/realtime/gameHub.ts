import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { getToken } from '../auth/token'
import type { GameDto, Guid, Move, MoveResultDto } from '../api'

let conn: HubConnection | null = null
const subscribers = new Set<GameHubEventHandlers>()
const moveHistory: Array<{ move: Move; result: MoveResultDto }> = []
let listenersAttached = false

export function getGameHub(): HubConnection {
  if (!conn) {
    conn = new HubConnectionBuilder()
      .withUrl('/hub/game', { accessTokenFactory: () => getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()
    attachGameHubListeners(conn)
  }
  return conn
}

function notify(fn: (handler: GameHubEventHandlers) => void): void {
  for (const handler of subscribers) fn(handler)
}

function attachGameHubListeners(c: HubConnection): void {
  if (listenersAttached) return
  listenersAttached = true

  c.on('StartOpponentSearch', () => {
    notify((handler) => handler.onSearchStarted?.())
  })
  c.on('StopOpponentSearch', () => {
    notify((handler) => handler.onSearchStopped?.())
  })
  c.on('GameStarted', (game: unknown) => {
    moveHistory.length = 0
    notify((handler) => handler.onGameStarted?.(game as GameDto))
  })
  c.on('MoveMade', (move: unknown, result: unknown) => {
    const event = { move: move as Move, result: result as MoveResultDto }
    moveHistory.push(event)
    notify((handler) => handler.onMoveMade?.(event.move, event.result))
  })
  c.on('UserDisconnected', (userId: unknown) => {
    notify((handler) => handler.onUserDisconnected?.(userId as Guid))
  })
  c.on('GameEnded', () => {
    notify((handler) => handler.onGameEnded?.())
  })
  c.on('TimeExpired', (gameId: unknown, userId: unknown) => {
    notify((handler) =>
      handler.onTimeExpired?.(gameId as Guid, userId as Guid),
    )
  })
}

async function ensureStarted(): Promise<HubConnection> {
  const c = getGameHub()
  if (c.state === HubConnectionState.Disconnected) {
    await c.start()
  }
  return c
}

export async function stopGameHub(): Promise<void> {
  if (conn && conn.state !== HubConnectionState.Disconnected) {
    await conn.stop()
  }
  conn = null
  listenersAttached = false
  subscribers.clear()
  moveHistory.length = 0
}

export interface SearchOpponentRequest {
  isEnabled: boolean
  initialTimeSec: number
  incrementPerMoveSec: number
}

export const gameHub = {
  findGame: async (request: SearchOpponentRequest): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('FindGame', request)
  },
  cancelSearch: async (): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('CancelSearch')
  },
  makeMove: async (move: Move): Promise<MoveResultDto> => {
    const c = await ensureStarted()
    return c.invoke<MoveResultDto>('MakeMove', move)
  },
  resign: async (): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('Resign')
  },
}

export interface GameHubEventHandlers {
  onSearchStarted?: () => void
  onSearchStopped?: () => void
  onGameStarted?: (game: GameDto) => void
  onMoveMade?: (move: Move, result: MoveResultDto) => void
  onUserDisconnected?: (userId: Guid) => void
  onGameEnded?: () => void
  onTimeExpired?: (gameId: Guid, userId: Guid) => void
}

export function subscribeGameHub(handlers: GameHubEventHandlers): () => void {
  getGameHub()
  subscribers.add(handlers)

  if (handlers.onMoveMade) {
    for (const event of moveHistory) handlers.onMoveMade(event.move, event.result)
  }

  return () => {
    subscribers.delete(handlers)
  }
}
