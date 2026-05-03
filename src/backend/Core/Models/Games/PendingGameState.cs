using Core.Models.Interfaces;
using Core.Models.Chess;
using Core.Exceptions;

namespace Core.Models.Games;

public class PendingGameState : IGameState
{
    public MoveResult MakeMove(Game game, Move move, Guid playerId)
    {
        if (game.GetMoveCount() != 0) throw new CoreLogicException("invalid state");
        if (playerId != game.WhitePlayerId) throw new CoreLogicException("white must make first move");
        ChessMoveResult result = game.ApplyMove(move);
        if (!result.IsValid) return new MoveResult(result, null);
        DateTime currentTime = DateTime.UtcNow;
        game.SetGameStartTime(currentTime);
        game.SetMoveStartTime(game.BlackPlayerId, currentTime);
        game.SetState(new ActiveGameState());
        return new MoveResult(result, null);
    }

    public void HandleResign(Game game, Guid playerId) => throw new CoreLogicException("game has not started yet");

    public void HandleTimeout(Game game, Guid playerId) => throw new CoreLogicException("game has not started yet");

    public void HandleDisconnect(Game game, Guid playerId)
    {
        if (playerId != game.WhitePlayerId && playerId != game.BlackPlayerId) throw new CoreLogicException("invalid player");
        game.SetState(new FinishedGameState());
    }
}