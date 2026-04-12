using Core.Models.Chess;
using Core.Models.Games;

namespace Core.Models.Interfaces;

public interface IGameState
{
    MoveResult MakeMove(Game game, Move move, Guid playerId);
    void HandleTimeout(Game game, Guid playerId);
    void HandleResign(Game game, Guid playerId);
    void HandleDisconnect(Game game, Guid playerId);
}