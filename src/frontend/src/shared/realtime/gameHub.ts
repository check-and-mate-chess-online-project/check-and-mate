import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { getToken } from '../auth/token'
import type { GameDto, Guid, Move, MoveResultDto } from '../api'

let conn: HubConnection | null = null

export function getGameHub(): HubConnection {
  if (!conn) {
    conn = new HubConnectionBuilder()
      .withUrl('/hub/game', { accessTokenFactory: () => getToken() ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()
  }
  return conn
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
  const c = getGameHub()
  const subs: Array<[string, (...args: unknown[]) => void]> = []

  if (handlers.onSearchStarted) {
    const fn = () => handlers.onSearchStarted!()
    c.on('StartOpponentSearch', fn)
    subs.push(['StartOpponentSearch', fn])
  }
  if (handlers.onSearchStopped) {
    const fn = () => handlers.onSearchStopped!()
    c.on('StopOpponentSearch', fn)
    subs.push(['StopOpponentSearch', fn])
  }
  if (handlers.onGameStarted) {
    const fn = (game: unknown) => handlers.onGameStarted!(game as GameDto)
    c.on('GameStarted', fn)
    subs.push(['GameStarted', fn])
  }
  if (handlers.onMoveMade) {
    const fn = (move: unknown, result: unknown) =>
      handlers.onMoveMade!(move as Move, result as MoveResultDto)
    c.on('MoveMade', fn)
    subs.push(['MoveMade', fn])
  }
  if (handlers.onUserDisconnected) {
    const fn = (userId: unknown) =>
      handlers.onUserDisconnected!(userId as Guid)
    c.on('UserDisconnected', fn)
    subs.push(['UserDisconnected', fn])
  }
  if (handlers.onGameEnded) {
    const fn = () => handlers.onGameEnded!()
    c.on('GameEnded', fn)
    subs.push(['GameEnded', fn])
  }
  if (handlers.onTimeExpired) {
    const fn = (gameId: unknown, userId: unknown) =>
      handlers.onTimeExpired!(gameId as Guid, userId as Guid)
    c.on('TimeExpired', fn)
    subs.push(['TimeExpired', fn])
  }

  return () => {
    for (const [event, fn] of subs) c.off(event, fn)
  }
}
