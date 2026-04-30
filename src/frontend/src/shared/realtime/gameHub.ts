import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { getToken } from '../auth/token'
import type { GameDto, Move, MoveResultDto } from '../api'

let conn: HubConnection | null = null

export function getGameHub(): HubConnection {
  if (!conn) {
    conn = new HubConnectionBuilder()
      .withUrl('/hub', { accessTokenFactory: () => getToken() ?? '' })
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

export const gameHub = {
  startGame: async (
    timeSec: number,
    increment: number,
  ): Promise<GameDto | null> => {
    const c = await ensureStarted()
    return c.invoke<GameDto | null>('StartGame', timeSec, increment)
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
