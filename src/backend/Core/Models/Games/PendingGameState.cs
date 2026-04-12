using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class PendingGameState : IGameState
{
    public MoveResult MakeMove(Game game, Move move, Guid playerId)
    {
        if (game.GetMoveCount() != 0) throw new InvalidOperationException("invalid state");
        if (playerId != game.WhitePlayerId) throw new InvalidOperationException("white must make first move");
        ChessMoveResult result = game.ApplyMove(move);
        if (!result.IsValid) return new MoveResult(result, null);
        DateTime currentTime = DateTime.UtcNow;
        game.SetGameStartTime(currentTime);
        game.SetMoveStartTime(game.BlackPlayerId, currentTime);
        game.SetState(new ActiveGameState());
        return new MoveResult(result, null);
    }

    public void HandleResign(Game game, Guid playerId) => throw new InvalidOperationException("game has not started yet");

    public void HandleTimeout(Game game, Guid playerId) => throw new InvalidOperationException("game has not started yet");

    public void HandleDisconnect(Game game, Guid playerId) => game.SetState(new FinishedGameState());
}