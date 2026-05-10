import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr'
import { getToken } from '../auth/token'
import type {
  GameDto,
  GameInvitationDto,
  Guid,
  MakeMoveRequest,
  MoveResultDto,
} from '../api'

let conn: HubConnection | null = null
const subscribers = new Set<GameHubEventHandlers>()
const moveHistory: Array<{ move: MakeMoveRequest; result: MoveResultDto }> = []
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

interface MoveEventPayload {
  request: MakeMoveRequest
  result: MoveResultDto
}

interface PlayerEventPayload {
  game: GameDto
  userId: Guid
}

function attachGameHubListeners(c: HubConnection): void {
  if (listenersAttached) return
  listenersAttached = true

  c.on('startOpponentSearch', () => {
    notify((handler) => handler.onSearchStarted?.())
  })
  c.on('stopOpponentSearch', () => {
    notify((handler) => handler.onSearchStopped?.())
  })
  c.on('gameStarted', (game: unknown) => {
    moveHistory.length = 0
    notify((handler) => handler.onGameStarted?.(game as GameDto))
  })
  c.on('moveMade', (payload: unknown) => {
    const { request, result } = payload as MoveEventPayload
    moveHistory.push({ move: request, result })
    notify((handler) => handler.onMoveMade?.(request, result))
  })
  c.on('moveRejected', (payload: unknown) => {
    const { request, result } = payload as MoveEventPayload
    notify((handler) => handler.onMoveRejected?.(request, result))
  })
  c.on('playerResigned', (payload: unknown) => {
    const { game, userId } = payload as PlayerEventPayload
    notify((handler) => handler.onPlayerResigned?.(game, userId))
  })
  c.on('playerLeft', (payload: unknown) => {
    const { game, userId } = payload as PlayerEventPayload
    notify((handler) => handler.onPlayerLeft?.(game, userId))
  })
  c.on('timeExpired', (payload: unknown) => {
    const { game, userId } = payload as PlayerEventPayload
    notify((handler) => handler.onTimeExpired?.(game, userId))
  })
  c.on('gameInvitationReceived', (invitation: unknown) => {
    notify((handler) =>
      handler.onGameInvitationReceived?.(invitation as GameInvitationDto),
    )
  })
  c.on('gameInvitationSent', (invitation: unknown) => {
    notify((handler) =>
      handler.onGameInvitationSent?.(invitation as GameInvitationDto),
    )
  })
  c.on('gameInvitationAccepted', (invitation: unknown) => {
    notify((handler) =>
      handler.onGameInvitationAccepted?.(invitation as GameInvitationDto),
    )
  })
  c.on('gameInvitationRejected', (invitation: unknown) => {
    notify((handler) =>
      handler.onGameInvitationRejected?.(invitation as GameInvitationDto),
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
  timeControlIsEnabled: boolean
  initialTimeSec: number
  incrementPerMoveSec: number
}

export interface SendGameInvitationRequest {
  receiverId?: Guid
  receiverLogin?: string
  timeControlIsEnabled: boolean
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
  makeMove: async (move: MakeMoveRequest): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('MakeMove', move)
  },
  resign: async (): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('Resign')
  },
  leave: async (): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('Leave')
  },
  getPendingInvitations: async (): Promise<GameInvitationDto[]> => {
    const c = await ensureStarted()
    return c.invoke<GameInvitationDto[]>('GetPendingInvitations')
  },
  sendGameInvitation: async (
    request: SendGameInvitationRequest,
  ): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('SendGameInvitation', request)
  },
  acceptGameInvitation: async (invitationId: Guid): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('AcceptGameInvitation', invitationId)
  },
  rejectGameInvitation: async (invitationId: Guid): Promise<void> => {
    const c = await ensureStarted()
    await c.invoke('RejectGameInvitation', invitationId)
  },
}

export interface GameHubEventHandlers {
  onSearchStarted?: () => void
  onSearchStopped?: () => void
  onGameStarted?: (game: GameDto) => void
  onMoveMade?: (move: MakeMoveRequest, result: MoveResultDto) => void
  onMoveRejected?: (move: MakeMoveRequest, result: MoveResultDto) => void
  onPlayerResigned?: (game: GameDto, userId: Guid) => void
  onPlayerLeft?: (game: GameDto, userId: Guid) => void
  onTimeExpired?: (game: GameDto, userId: Guid) => void
  onGameInvitationReceived?: (invitation: GameInvitationDto) => void
  onGameInvitationSent?: (invitation: GameInvitationDto) => void
  onGameInvitationAccepted?: (invitation: GameInvitationDto) => void
  onGameInvitationRejected?: (invitation: GameInvitationDto) => void
}

export function subscribeGameHub(handlers: GameHubEventHandlers): () => void {
  getGameHub()
  ensureStarted().catch(() => {})
  subscribers.add(handlers)

  if (handlers.onMoveMade) {
    for (const event of moveHistory) handlers.onMoveMade(event.move, event.result)
  }

  return () => {
    subscribers.delete(handlers)
  }
}
