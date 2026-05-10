using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IFriendshipService
{
    Task<List<FriendRequestDto>> GetAllFriendRequestsAsync(Guid userId);
    Task<List<Guid>> GetAllFriendsAsync(Guid userId);
    Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, Guid receiverId);
    Task<FriendRequestDto> SendFriendRequestAsync(Guid senderId, string receiverLogin);
    Task AcceptFriendRequestAsync(Guid requestId);
    Task RejectFriendRequestAsync(Guid requestId);
    Task RemoveFriendAsync(Guid friendAId, Guid friendBId);
}