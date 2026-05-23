import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type {
  FriendRequestDto,
  GameInvitationDto,
  Guid,
  UserPublicDto,
} from '../shared/api'
import { ApiError } from '../shared/api/http'
import { useAuth } from '../shared/auth/useAuth'
import {
  useAcceptFriendRequest,
  useDeleteFriend,
  useFriendRequests,
  useFriendsList,
  useGameInvitations,
  useRejectFriendRequest,
  useSendFriendRequest,
} from '../shared/api/hooks'
import { gameHub } from '../shared/realtime/gameHub'
import { InviteToGameModal } from '../shared/ui/InviteToGameModal'

type Tab = 'friends' | 'incoming' | 'outgoing' | 'invitations'

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError && e.message) return e.message
  if (e instanceof Error && e.message && !/failed to fetch/i.test(e.message)) {
    return e.message
  }
  return fallback
}

export function FriendsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const friendsQuery = useFriendsList()
  const requestsQuery = useFriendRequests()
  const invitationsQuery = useGameInvitations()
  const sendFriendRequest = useSendFriendRequest()
  const acceptRequest = useAcceptFriendRequest()
  const rejectRequest = useRejectFriendRequest()
  const deleteFriend = useDeleteFriend()
  const [tab, setTab] = useState<Tab>('friends')
  const [search, setSearch] = useState('')
  const [inviteTarget, setInviteTarget] = useState<{ login: string } | null>(
    null,
  )

  const tabs: Tab[] = ['friends', 'incoming', 'outgoing', 'invitations']

  const incoming =
    requestsQuery.data?.filter((r) => r.receiver.id === user?.id) ?? []
  const outgoing =
    requestsQuery.data?.filter((r) => r.sender.id === user?.id) ?? []

  const handleAddFriend = () => {
    const login = search.trim()
    if (!login) return
    if (user && login.toLowerCase() === user.login.toLowerCase()) {
      toast.error(t('pages.friends.cantAddSelf'))
      return
    }
    sendFriendRequest.mutate(
      { receiverLogin: login },
      {
        onSuccess: () => {
          toast.success(t('pages.friends.requestSent'))
          setSearch('')
        },
        onError: (e) => toast.error(errorMessage(e, t('pages.friends.requestFailed'))),
      },
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl mb-6">{t('pages.friends.title')}</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
          placeholder={t('pages.friends.searchPlaceholder')}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-violet-500"
        />
        <button
          type="button"
          disabled={!search.trim() || sendFriendRequest.isPending}
          onClick={handleAddFriend}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-md"
        >
          {t('pages.friends.addButton')}
        </button>
      </div>

      <div className="flex gap-1 border-b border-violet-900 mb-4">
        {tabs.map((to) => (
          <button
            key={to}
            type="button"
            onClick={() => setTab(to)}
            className={`px-4 py-2 -mb-px border-b-2 ${
              tab === to
                ? 'border-violet-500 text-violet-100'
                : 'border-transparent text-violet-400 hover:text-violet-200'
            }`}
          >
            {t(`pages.friends.tabs.${to}`)}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <FriendsList
          friends={friendsQuery.data ?? []}
          onInvite={(friend) => setInviteTarget({ login: friend.login })}
          onRemove={(id) =>
            deleteFriend.mutate(id, {
              onError: (e) =>
                toast.error(errorMessage(e, t('pages.friends.removeFailed'))),
            })
          }
          emptyText={t('pages.friends.empty')}
        />
      )}

      {tab === 'incoming' && (
        <RequestsList
          requests={incoming}
          mode="incoming"
          onAccept={(id) =>
            acceptRequest.mutate(id, {
              onError: (e) =>
                toast.error(errorMessage(e, t('pages.friends.acceptFailed'))),
            })
          }
          onReject={(id) =>
            rejectRequest.mutate(id, {
              onError: (e) =>
                toast.error(errorMessage(e, t('pages.friends.rejectFailed'))),
            })
          }
          emptyText={t('pages.friends.empty')}
        />
      )}

      {tab === 'outgoing' && (
        <RequestsList
          requests={outgoing}
          mode="outgoing"
          emptyText={t('pages.friends.empty')}
        />
      )}

      {tab === 'invitations' && (
        <InvitationsList
          invitations={invitationsQuery.data ?? []}
          onAccept={(id) =>
            gameHub
              .acceptGameInvitation(id)
              .catch((e) =>
                toast.error(errorMessage(e, t('invitations.acceptFailed'))),
              )
          }
          onReject={(id) =>
            gameHub
              .rejectGameInvitation(id)
              .catch((e) =>
                toast.error(errorMessage(e, t('pages.friends.rejectFailed'))),
              )
          }
          emptyText={t('pages.friends.empty')}
        />
      )}

      {inviteTarget && (
        <InviteToGameModal
          target={inviteTarget}
          onClose={() => setInviteTarget(null)}
        />
      )}
    </div>
  )
}

interface FriendsListProps {
  friends: UserPublicDto[]
  onInvite: (friend: UserPublicDto) => void
  onRemove: (id: Guid) => void
  emptyText: string
}

function FriendsList({ friends, onInvite, onRemove, emptyText }: FriendsListProps) {
  if (friends.length === 0) {
    return <p className="text-slate-500 text-center py-12">{emptyText}</p>
  }
  return (
    <ul className="space-y-2">
      {friends.map((friend) => (
        <li
          key={friend.id}
          className="flex items-center justify-between bg-slate-900/60 border border-violet-900 rounded-md px-4 py-3"
        >
          <span className="text-sm text-slate-200">{friend.login}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onInvite(friend)}
              className="px-3 py-1 text-sm bg-violet-600 hover:bg-violet-500 rounded-md"
            >
              Invite
            </button>
            <button
              type="button"
              onClick={() => onRemove(friend.id)}
              className="px-3 py-1 text-sm text-orange-400 hover:text-orange-300"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

interface RequestsListProps {
  requests: FriendRequestDto[]
  mode: 'incoming' | 'outgoing'
  onAccept?: (id: Guid) => void
  onReject?: (id: Guid) => void
  emptyText: string
}

function RequestsList({
  requests,
  mode,
  onAccept,
  onReject,
  emptyText,
}: RequestsListProps) {
  if (requests.length === 0) {
    return <p className="text-slate-500 text-center py-12">{emptyText}</p>
  }
  return (
    <ul className="space-y-2">
      {requests.map((r) => {
        const other = mode === 'incoming' ? r.sender : r.receiver
        return (
          <li
            key={r.id}
            className="flex items-center justify-between bg-slate-900/60 border border-violet-900 rounded-md px-4 py-3"
          >
            <span className="text-sm text-slate-200">{other.login}</span>
            {mode === 'incoming' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept?.(r.id)}
                  className="px-3 py-1 text-sm bg-violet-600 hover:bg-violet-500 rounded-md"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(r.id)}
                  className="px-3 py-1 text-sm text-orange-400 hover:text-orange-300"
                >
                  ✕
                </button>
              </div>
            )}
            {mode === 'outgoing' && (
              <span className="text-xs text-slate-500">pending</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

interface InvitationsListProps {
  invitations: GameInvitationDto[]
  onAccept: (id: Guid) => void
  onReject: (id: Guid) => void
  emptyText: string
}

function InvitationsList({
  invitations,
  onAccept,
  onReject,
  emptyText,
}: InvitationsListProps) {
  if (invitations.length === 0) {
    return <p className="text-slate-500 text-center py-12">{emptyText}</p>
  }
  return (
    <ul className="space-y-2">
      {invitations.map((inv) => (
        <li
          key={inv.id}
          className="flex items-center justify-between bg-slate-900/60 border border-violet-900 rounded-md px-4 py-3"
        >
          <span className="text-sm text-slate-200">{inv.sender.login}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAccept(inv.id)}
              className="px-3 py-1 text-sm bg-violet-600 hover:bg-violet-500 rounded-md"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => onReject(inv.id)}
              className="px-3 py-1 text-sm text-orange-400 hover:text-orange-300"
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
