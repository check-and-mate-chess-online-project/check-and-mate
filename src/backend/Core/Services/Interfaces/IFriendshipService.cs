using Core.Models.Users;

namespace Core.Services.Interfaces;

public interface IFriendshipService
{
    Task<Friendship?> GetFriendshipAsync(Guid userId, Guid friendId);
    Task AddFriendshipAsync(Guid userId, Guid friendId);
    Task RemoveFriendshipAsync(Guid userId, Guid friendId);
}