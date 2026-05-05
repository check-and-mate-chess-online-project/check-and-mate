import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './http'
import type {
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

interface FriendsResponse {
  friends: UserDto[]
  incomingRequests: UserDto[]
  outgoingRequests: UserDto[]
  gameInvitations: unknown[]
}

export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => api.get<FriendsResponse>('/api/users/me/friends'),
  })
}
