using Core.Models.Users;

namespace Core.Repositories;

public interface IFriendshipRepository
{
    Task<Friendship?> GetAsync(Guid friendAId, Guid friendBId);
    Task<List<Guid>> GetByUserAsync(Guid userId);
    void Add(Friendship friendship);
    void Remove(Friendship friendship);
}