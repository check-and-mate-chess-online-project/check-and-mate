using System.Collections.Concurrent;
using Core.Repositories;

namespace Infrastructure.Persistence.InMemory;

public class UserSkinRepository : IUserSkinRepository
{
    private readonly ConcurrentDictionary<Guid, HashSet<Guid>> _userSkins = new();

    public Task<bool> ContainsAsync(Guid userId, Guid skinId)
    {
        if (_userSkins.TryGetValue(userId, out var skinIds))
        {
            return Task.FromResult(skinIds.Contains(skinId));
        }
        return Task.FromResult(false);
    }

    public Task<List<Guid>> GetUserSkinIdsAsync(Guid userId)
    {
        if (_userSkins.TryGetValue(userId, out var skinIds))
        {
            return Task.FromResult(skinIds.ToList());
        }
        return Task.FromResult(new List<Guid>());
    }

    public void Add(Guid userId, Guid skinId)
    {
        _userSkins.AddOrUpdate(
            userId,
            _ => [skinId],
            (_, existingSet) =>
            {
                existingSet.Add(skinId);
                return existingSet;
            }
        );
    }
}