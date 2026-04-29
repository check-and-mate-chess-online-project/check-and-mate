using Core.Models.Interfaces;
using Core.Models.Users;

namespace Application.Abstractions.Matchmaking;

public interface IMatchmakingPool
{
    Dictionary<User, ITimeControl> GetAll();
    void AddUser(User user, ITimeControl timeControl);
    bool TryRemoveUser(User user);
}