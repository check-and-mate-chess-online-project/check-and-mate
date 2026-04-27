using Application.Abstractions.Matchmaking;
using Core.Models.Interfaces;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class MatchmakingPool : IMatchmakingPool
{
    private readonly Dictionary<User, ITimeControl> _pool = [];

    public Dictionary<User, ITimeControl> GetAll() => _pool;

    public void AddUser(User user, ITimeControl timeControl) => _pool[user] = timeControl;

    public void RemoveUser(User user) => _pool.Remove(user);
}