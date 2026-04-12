using Core.Models.Users;

namespace Core.Repositories.Interfaces;

public interface IFriendshipRepository
{
    Task AddAsync(Friendship friendship);
    Task RemoveAsync(Guid userId, Guid friendId);
}