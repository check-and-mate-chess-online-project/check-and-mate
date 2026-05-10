using Core.Repositories;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class FriendshipRepository : IFriendshipRepository
{
    private readonly List<Friendship> _friendships = new();
    private readonly object _lock = new();

    public Task<Friendship?> GetAsync(Guid friendAId, Guid friendBId)
    {
        lock (_lock)
        {
            var id1 = friendAId < friendBId ? friendAId : friendBId;
            var id2 = friendAId < friendBId ? friendBId : friendAId;
            
            return Task.FromResult(_friendships.FirstOrDefault(f => 
                f.FriendAId == id1 && f.FriendBId == id2));
        }
    }

    public Task<List<Guid>> GetByUserAsync(Guid userId)
    {
        lock (_lock)
            return Task.FromResult(_friendships
                .Where(f => f.FriendAId == userId || f.FriendBId == userId)
                .Select(f => f.FriendAId == userId ? f.FriendBId : f.FriendAId)
                .ToList());
    }

    public void Add(Friendship friendship)
    {
        lock (_lock) _friendships.Add(friendship);
    }

    public void Remove(Friendship friendship)
    {
        lock (_lock) _friendships.Remove(friendship);
    }
}