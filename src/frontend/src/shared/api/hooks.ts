import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './http'
import type {
  FriendRequestDto,
  GameDto,
  Guid,
  LootBoxDropResultDto,
  PlanetDto,
  SkinDto,
  UserDto,
} from '.'
import type { FigureType } from './enums'

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

export function useUserProfile(id: Guid) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get<UserDto>(`/api/users/${id}`),
    enabled: !!id,
  })
}

export function usePlanets() {
  return useQuery({
    queryKey: ['planets'],
    queryFn: () => api.get<PlanetDto[]>('/api/planets'),
  })
}

export function usePlanetSkins(planetId: Guid) {
  return useQuery({
    queryKey: ['planet-skins', planetId],
    queryFn: () => api.get<SkinDto[]>(`/api/planets/${planetId}/skins`),
    enabled: !!planetId,
  })
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
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
    queryFn: () => api.get<GameDto[]>('/api/users/me/games'),
  })
}

export function useGame(id: Guid) {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => api.get<GameDto>(`/api/games/${id}`),
    enabled: !!id,
  })
}

export function useFriendsList() {
  return useQuery({
    queryKey: ['friends', 'list'],
    queryFn: () => api.get<Guid[]>('/api/friends'),
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
    mutationFn: (body: { receiverId: Guid }) =>
      api.post<FriendRequestDto>('/api/friends/requests', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends', 'requests'] }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['friends', 'requests'] }),
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
