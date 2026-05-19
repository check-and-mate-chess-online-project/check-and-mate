using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Utils;
using Application.Dtos;
using Application.Exceptions;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Users;
using Core.Exceptions;

namespace Application.Services;

public class FriendshipService(
    IFriendshipRepository friendshipRepos, 
    IFriendRequestRepository requestRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepos = friendshipRepos;
    private readonly IFriendRequestRepository _requestRepos = requestRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<List<FriendRequestDto>> GetPendingFriendRequestsAsync(Guid userId)
    {
        List<FriendRequest> requests = await _requestRepos.GetPendingByUserAsync(userId);
        List<FriendRequestDto> requestDtos = [];
        foreach (var request in requests)
        {
            FriendRequestDto requestDto = await FriendRequestMapper.ToDto(request, _userRepos);
            requestDtos.Add(requestDto);
        }
        return requestDtos;
    }
        
    public async Task<List<UserPublicDto>> GetAllFriendsAsync(Guid userId)
    {
        List<Guid> friendIds = await _friendshipRepos.GetByUserAsync(userId);
        List<UserPublicDto> friends = [];
        foreach (var friendId in friendIds)
        {
            User friend = await _userRepos.GetAsync(friendId) ?? throw new InvalidOperationException($"friend {friendId} not exist");
            UserPublicDto friendDto = UserPublicMapper.ToDto(friend);
            friends.Add(friendDto);
        }
        return friends;
    }

    public async Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, string receiverLogin)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new NotFoundException($"user {senderId} not found");
        if (sender.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        User receiver = await _userRepos.GetAsync(receiverLogin) ?? throw new NotFoundException($"user {receiverLogin} not found");
        if (receiver.IsDeleted) throw new UserDeletedException($"user {receiverLogin} is deleted");
        if (senderId == receiver.Id) throw new CoreLogicException("users must be different");
        if (await _requestRepos.GetPendingAsync(senderId, receiver.Id) != null) 
            throw new ConflictException($"friend request from {senderId} to {receiver.Id} already exist");
        FriendRequest? reverseRequest = await _requestRepos.GetPendingAsync(receiver.Id, senderId);
        if (reverseRequest != null) 
        {
            await AcceptFriendRequestAsync(reverseRequest.Id);
            return await FriendRequestMapper.ToDto(reverseRequest, _userRepos);
        }
        (Guid senderId, Guid userId) key = FriendshipKey.Normalize(senderId, receiver.Id);
        if (await _friendshipRepos.GetAsync(key.senderId, key.userId) != null) 
            throw new ConflictException($"users {senderId} and {receiver.Id} already friends");
        FriendRequest request = new(senderId, receiver.Id, FriendRequestState.Pending);
        _requestRepos.Add(request);
        await _uow.CommitChangesAsync();
        return await FriendRequestMapper.ToDto(request, _userRepos);
    }

    public async Task AcceptFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) 
            ?? throw new NotFoundException($"friend request {requestId} not found");
        if (request.State != FriendRequestState.Pending) 
            throw new ConflictException($"friend request {requestId} already resolved");
        (Guid senderId, Guid receiverId) = FriendshipKey.Normalize(request.SenderId, request.ReceiverId);
        request.ChangeState(FriendRequestState.Accepted);
        _requestRepos.Update(request);
        Friendship friendship = new(senderId, receiverId);
        _friendshipRepos.Add(friendship);
        await _uow.CommitChangesAsync();
    }

    public async Task RejectFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) 
            ?? throw new NotFoundException($"friend request {requestId} not found");
        if (request.State != FriendRequestState.Pending) 
            throw new ConflictException($"friend request {requestId} already resolved");
        request.ChangeState(FriendRequestState.Rejected);
        _requestRepos.Update(request);
        await _uow.CommitChangesAsync();
    }

    public async Task RemoveFriendAsync(Guid friendAId, Guid friendBId)
    {
        (Guid friendAId, Guid friendBId) key = FriendshipKey.Normalize(friendAId, friendBId);
        Friendship friendship = await _friendshipRepos.GetAsync(key.friendAId, key.friendBId) 
            ?? throw new NotFoundException($"friendship between {key.friendAId} and {key.friendBId} not found");
        _friendshipRepos.Remove(friendship);
        await _uow.CommitChangesAsync();
    }
}