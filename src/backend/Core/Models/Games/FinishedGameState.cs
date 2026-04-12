using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class FinishedGameState : IGameState
{
    public MoveResult MakeMove(Game game, Move move, Guid playerId) => throw new InvalidOperationException("game is finished");

    public void HandleResign(Game game, Guid playerId) => throw new InvalidOperationException("game is finished");

    public void HandleTimeout(Game game, Guid playerId) => throw new InvalidOperationException("game is finished");
    
    public void HandleDisconnect(Game game, Guid playerId) => throw new InvalidOperationException("game is finished");
}