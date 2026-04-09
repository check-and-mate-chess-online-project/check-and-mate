using Core.Models.Chess;
using Core.Models.Games;

namespace Core.Models.Interfaces;

public interface IGameState
{
    MoveResult MakeMove(Game game, Move move, int playerId);
    void HandleTimeout(Game game, int playerId);
    void HandleResign(Game game, int playerId);
    void HandleDisconnect(Game game, int playerId);
}