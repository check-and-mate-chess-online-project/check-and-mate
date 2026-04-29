using System.Collections.Concurrent;
using Application.Abstractions.Matchmaking;
using Core.Models.Interfaces;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class MatchmakingPool : IMatchmakingPool
{
    private readonly ConcurrentDictionary<User, ITimeControl> _pool = [];

    public Dictionary<User, ITimeControl> GetAll() => _pool.ToDictionary();

    public void AddUser(User user, ITimeControl timeControl) => _pool[user] = timeControl;

    public bool TryRemoveUser(User user) => _pool.TryRemove(user, out _);
}