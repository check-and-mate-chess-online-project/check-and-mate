import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './http'
import { gameHub } from '../realtime/gameHub'
import { PLANETS, planetById } from '../lib/planets'
import type {
  FriendRequestDto,
  GameDto,
  Guid,
  LootBoxDropResultDto,
  PlanetDto,
  SkinConfigurationDto,
  SkinDto,
  UserDto,
  UserPublicDto,
} from '.'
import { type FigureType, normalizeFigureType } from './enums'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<UserDto>('/api/profile/me'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { login?: string; email?: string }) =>
      api.patch<void>('/api/profile/me', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { oldPassword: string; newPassword: string }) =>
      api.post<void>('/api/profile/change-password', body),
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (body: { password: string }) =>
      api.delete<void>('/api/profile/me', body),
  })
}

export function useUserProfile(login: string) {
  return useQuery({
    queryKey: ['user', login],
    queryFn: () => api.get<UserPublicDto>(`/api/profile/${login}`),
    enabled: !!login,
  })
}

export function useUserSkins(login: string) {
  return useQuery({
    queryKey: ['user-skins', login],
    queryFn: () => api.get<SkinDto[]>(`/api/inventory/skins/${login}`),
    enabled: !!login,
  })
}

export function useSkinConfiguration() {
  return useQuery({
    queryKey: ['skin-configuration'],
    queryFn: () =>
      api.get<SkinConfigurationDto>('/api/inventory/skins/current'),
  })
}

export function usePlanets() {
  const data: PlanetDto[] = PLANETS.map((p) => ({
    id: p.id,
    name: p.id,
    imageUrl: p.imageUrl,
  }))
  return { data, isLoading: false } as const
}

export function usePlanetSkins(planetId: Guid) {
  const { data: inventory, isLoading } = useInventory()
  const planet = planetById(planetId)
  if (!planet) return { data: [] as SkinDto[], isLoading } as const
  const byFigure = new Map<number, SkinDto>()
  for (const s of inventory ?? []) {
    const f = normalizeFigureType(s.figure)
    if (f !== null) byFigure.set(f, s)
  }
  const data: SkinDto[] = planet.figures.map((figure) => {
    const owned = byFigure.get(figure as number)
    if (owned) return owned
    return placeholderSkin(planet.id, figure)
  })
  return { data, isLoading } as const
}

function placeholderSkin(planetId: string, figure: FigureType): SkinDto {
  return {
    id: `__placeholder__:${planetId}:${figure}`,
    setId: planetId,
    name: '',
    description: null,
    figure,
    rarity: 1,
    assets: {
      whiteBoardImage: '',
      blackBoardImage: '',
      idleImage: '',
      startFightWinImage: '',
      startFightLoseImage: '',
      endFightWinImage: '',
      endFightLoseImage: '',
    },
    isDefault: false,
  }
}

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get<SkinDto[]>('/api/inventory/skins'),
  })
}

export function useEquipSkin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { figure: FigureType; skinId: Guid }) =>
      api.post<void>('/api/inventory/skins/equip', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] })
      qc.invalidateQueries({ queryKey: ['skin-configuration'] })
    },
  })
}

export function useOpenLootbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post<LootBoxDropResultDto>('/api/inventory/lootboxes/open'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useBuyLootbox() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (count: number) =>
      api.post<void>('/api/shop/lootboxes/buy', { count }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useGameHistory() {
  return useQuery({
    queryKey: ['games', 'history'],
    queryFn: () => api.get<GameDto[]>('/api/archive/games'),
  })
}

export function useFriendsList() {
  return useQuery({
    queryKey: ['friends', 'list'],
    queryFn: () => api.get<UserPublicDto[]>('/api/friends'),
  })
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['friends', 'requests'],
    queryFn: () => api.get<FriendRequestDto[]>('/api/friends/requests'),
  })
}

export function useSendFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { receiverLogin: string }) =>
      api.post<FriendRequestDto>('/api/friends/requests', body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] }),
  })
}

export function useAcceptFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (friendRequestId: Guid) =>
      api.patch<void>(`/api/friends/requests/${friendRequestId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['friends'] })
    },
  })
}

export function useRejectFriendRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (friendRequestId: Guid) =>
      api.patch<void>(`/api/friends/requests/${friendRequestId}/reject`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['friends', 'requests'] }),
  })
}

export function useDeleteFriend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (friendId: Guid) =>
      api.delete<void>(`/api/friends/${friendId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends', 'list'] }),
  })
}

export function useGameInvitations() {
  return useQuery({
    queryKey: ['game-invitations'],
    queryFn: () => gameHub.getPendingInvitations(),
  })
}
