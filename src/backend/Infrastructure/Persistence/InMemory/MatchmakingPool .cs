using Application.Abstractions.Matchmaking;
using Core.Models.Interfaces;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class MatchmakingPool : IMatchmakingPool
{
    private readonly Dictionary<User, ITimeControl> _pool = new();

    public Dictionary<User, ITimeControl> GetAll()
    {
        return _pool;
    }

    public void AddUser(User user, ITimeControl timeControl)
    {
        if (!_pool.ContainsKey(user))
            _pool[user] = timeControl;
    }

    public void RemoveUser(User user)
    {
        _pool.Remove(user);
    }
}