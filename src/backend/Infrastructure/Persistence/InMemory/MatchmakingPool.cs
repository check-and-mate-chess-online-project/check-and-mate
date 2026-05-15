using System.Collections.Concurrent;
using Application.Abstractions.Matchmaking;
using Application.Models;

namespace Infrastructure.Persistence.InMemory;

public class MatchmakingPool : IMatchmakingPool
{
    private readonly ConcurrentDictionary<Guid, MatchmakingContext> _pool = [];

    public bool ContainsUser(Guid userId) => _pool.ContainsKey(userId);

    public List<MatchmakingContext> GetAll() => [.. _pool.Values];

    public void AddUser(MatchmakingContext context) => _pool[context.User.Id] = context;

    public bool TryRemoveUser(Guid userId) => _pool.TryRemove(userId, out _);
}