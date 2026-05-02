using Application.Models;

namespace Application.Abstractions.Matchmaking;

public interface IMatchmakingPool
{
    bool ContainsUser(Guid userId);
    List<MatchmakingContext> GetAll();
    void AddUser(MatchmakingContext context);
    bool TryRemoveUser(Guid userId);
}