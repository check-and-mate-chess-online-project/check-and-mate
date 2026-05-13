using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Utils;
using Application.Dtos;
using Application.Exceptions;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Users;

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
        => [.. (await _requestRepos.GetPendingByUserAsync(userId))
            .Select(FriendRequestMapper.ToDto)];
        
    public async Task<List<Guid>> GetAllFriendsAsync(Guid userId) => await _friendshipRepos.GetByUserAsync(userId);

    public async Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, Guid receiverId)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new NotFoundException($"user {senderId} not found");
        if (sender.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        User receiver = await _userRepos.GetAsync(receiverId) ?? throw new NotFoundException($"user {receiverId} not found");
        if (receiver.IsDeleted) throw new UserDeletedException($"user {receiverId} is deleted");
        return await Send(senderId, receiverId);
    }

    public async Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, string receiverLogin)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new NotFoundException($"user {senderId} not found");
        if (sender.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        User receiver = await _userRepos.GetAsync(receiverLogin) ?? throw new NotFoundException($"user {receiverLogin} not found");
        if (receiver.IsDeleted) throw new UserDeletedException($"user {receiverLogin} is deleted");
        return await Send(senderId, receiver.Id);
    }

    private async Task<FriendRequestDto> Send(Guid senderId, Guid receiverId)
    {
        if (await _requestRepos.GetPendingAsync(senderId, receiverId) != null) 
            throw new ConflictException($"friend request from {senderId} to {receiverId} already exist");
        FriendRequest? reverseRequest = await _requestRepos.GetPendingAsync(receiverId, senderId);
        if (reverseRequest != null) 
        {
            await AcceptFriendRequestAsync(reverseRequest.Id);
            return FriendRequestMapper.ToDto(reverseRequest);
        }
        (Guid senderId, Guid userId) key = FriendshipKey.Normalize(senderId, receiverId);
        if (await _friendshipRepos.GetAsync(key.senderId, key.userId) != null) 
            throw new ConflictException($"users {senderId} and {receiverId} already friends");
        FriendRequest request = new(senderId, receiverId, FriendRequestState.Pending);
        _requestRepos.Add(request);
        await _uow.CommitChangesAsync();
        return FriendRequestMapper.ToDto(request);
    }

    public async Task AcceptFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) ?? throw new NotFoundException($"friend request {requestId} not found");
        (Guid senderId, Guid receiverId) = FriendshipKey.Normalize(request.SenderId, request.ReceiverId);
        request.ChangeState(FriendRequestState.Accepted);
        _requestRepos.Update(request);
        Friendship friendship = new(senderId, receiverId);
        _friendshipRepos.Add(friendship);
        await _uow.CommitChangesAsync();
    }

    public async Task RejectFriendRequestAsync(Guid requestId)
    {
        FriendRequest request = await _requestRepos.GetAsync(requestId) ?? throw new NotFoundException($"friend request {requestId} not found");
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