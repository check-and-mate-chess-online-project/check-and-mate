using Core.Models.Users;

namespace Core.Repositories;

public interface IFriendshipRepository
{
    Task<Friendship?> GetAsync(Guid friendAId, Guid friendBId);
    void Add(Friendship friendship);
    void Remove(Friendship friendship);
}