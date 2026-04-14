using Core.Models.Users;

namespace Core.Repositories.Interfaces;

public interface IFriendshipRepository
{
    Task<Friendship?> GetAsync(Guid userId, Guid friendId);
    void Add(Friendship friendship);
    void Remove(Friendship friendship);
}