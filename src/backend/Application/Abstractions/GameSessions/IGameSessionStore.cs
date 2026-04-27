using Core.Models.Games;

namespace Application.Abstractions.GameSessions;

public interface IGameSessionStore
{
    Game? Get(Guid gameId);
    Game? GetByPlayers(Guid playerAId, Guid playerBId);
    Game? GetByUserId(Guid userId);
    List<Game> GetAll();
    void Add(Game game);
    void Update(Game game);
    void Remove(Game game);
}