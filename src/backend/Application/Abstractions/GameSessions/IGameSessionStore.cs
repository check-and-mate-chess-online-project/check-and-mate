using Core.Models.Games;

namespace Application.Abstractions.GameSessions;

public interface IGameSessionStore
{
    Game? Get(Guid gameId);
    Game? GetByPlayers(Guid playerAId, Guid playerBId);
    Game? GetByUserId(Guid userId);
    void Add(Game game);
    void Update();
    void Remove(Game game);
}