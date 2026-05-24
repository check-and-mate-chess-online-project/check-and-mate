using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IFriendshipService
{
    Task<List<FriendRequestDto>> GetPendingFriendRequestsAsync(Guid userId);
    Task<List<UserPublicDto>> GetAllFriendsAsync(Guid userId);
    Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, string receiverLogin);
    Task AcceptFriendRequestAsync(Guid userId, Guid requestId);
    Task RejectFriendRequestAsync(Guid userId, Guid requestId);
    Task RemoveFriendAsync(Guid friendAId, Guid friendBId);
}