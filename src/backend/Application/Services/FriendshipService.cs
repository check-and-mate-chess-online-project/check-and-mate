using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Utils;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Users;

namespace Application.Services;

public class FriendshipService(IFriendshipRepository friendshipRepos, IFriendRequestRepository requestRepos, IUserRepository userRepos, IUnitOfWork uow) : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepos = friendshipRepos;
    private readonly IFriendRequestRepository _requestRepos = requestRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task SendFriendRequestAsync(Guid senderId, Guid userId)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new ArgumentException($"user {senderId} not exist");
        if (sender.IsDeleted) throw new InvalidOperationException($"user {senderId} is deleted");
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        if (await _requestRepos.GetPendingAsync(senderId, userId) != null) throw new InvalidOperationException($"friend request from {senderId} to {userId} already exist");
        (Guid senderId, Guid userId) key = FriendshipKey.Normalize(senderId, userId);
        if (await _friendshipRepos.GetAsync(key.senderId, key.userId) != null) throw new InvalidOperationException($"users {senderId} and {userId} already friends");
        FriendRequest request = new(senderId, userId, FriendRequestState.Pending);
        _requestRepos.Add(request);
        await _uow.CommitChangesAsync();
    }

    public async Task AcceptFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) ?? throw new ArgumentException($"friend request {requestId} not exist");
        (Guid senderId, Guid userId) = FriendshipKey.Normalize(request.SenderId, request.UserId);
        request.ChangeState(FriendRequestState.Accepted);
        _requestRepos.Update(request);
        Friendship friendship = new(senderId, userId);
        _friendshipRepos.Add(friendship);
        await _uow.CommitChangesAsync();
    }

    public async Task RejectFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) ?? throw new ArgumentException($"friend request {requestId} not exist");
        request.ChangeState(FriendRequestState.Rejected);
        _requestRepos.Update(request);
        await _uow.CommitChangesAsync();
    }

    public async Task RemoveFriendshipAsync(Guid friendAId, Guid friendBId)
    {
        (Guid friendAId, Guid friendBId) key = FriendshipKey.Normalize(friendAId, friendBId);
        Friendship friendship = await _friendshipRepos.GetAsync(key.friendAId, key.friendBId) ?? throw new ArgumentException($"friendship between {key.friendAId} and {key.friendBId} not exist");
        _friendshipRepos.Remove(friendship);
        await _uow.CommitChangesAsync();
    }
}