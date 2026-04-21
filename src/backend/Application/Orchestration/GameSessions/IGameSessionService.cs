using Core.Models.Games;
using Core.Models.Interfaces;

namespace Application.Orchestration.GameSessions;

public interface IGameSessionService
{
    Game? Get(Guid gameId);
    Game? GetByPlayers(Guid playerAId, Guid playerBId);
    Game Create(Guid whitePlayerId, Guid blackPlayerId, ITimeControl timeControl);
    void Remove(Game game);
}