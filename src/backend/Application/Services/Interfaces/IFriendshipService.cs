namespace Application.Services.Interfaces;

public interface IFriendshipService
{
    Task SendFriendRequestAsync(Guid senderId, Guid userId);
    Task AcceptFriendRequestAsync(Guid requestId);
    Task RejectFriendRequestAsync(Guid requestId);
    Task RemoveFriendshipAsync(Guid friendAId, Guid friendBId);
}