using Core.Models.Interfaces;
using Core.Models.Chess;
using Core.Exceptions;

namespace Core.Models.Games;

public class ActiveGameState : IGameState
{
    public MoveResult MakeMove(Game game, Move move, Guid playerId)
    {
        if (playerId != game.GetCurrentPlayerId()) throw new CoreLogicException("invalid player");
        DateTime currentTime = DateTime.UtcNow;
        if (!game.CheckPlayerLeftTime(playerId, currentTime)) 
        {
            game.FinishGame(GameTerminationReason.Timeout, playerId);
            game.SetState(new FinishedGameState());
            return new MoveResult(MoveAttemptStatus.Timeout, GameTerminationReason.Timeout);
        }
        ChessMoveResult result = game.ApplyMove(move);
        if (!result.IsValid) return new MoveResult(MoveAttemptStatus.Invalid, null);
        game.UpdatePlayerTime(playerId, currentTime);
        game.SetMoveStartTime(game.GetCurrentPlayerId(), currentTime);
        GameTerminationReason? terminationReason = null;
        if (result.IsGameOver)
        {
            terminationReason = result.TerminationReason!.Value == ChessGameTerminationReason.CheckMate 
                ? GameTerminationReason.CheckMate 
                : GameTerminationReason.StaleMate;
            game.FinishGame((GameTerminationReason)terminationReason, playerId);
            game.SetState(new FinishedGameState());
        }
        return new MoveResult(MoveAttemptStatus.Success, terminationReason);
    }

    public void HandleTimeout(Game game, Guid playerId)
    {
        if (playerId != game.GetCurrentPlayerId()) throw new CoreLogicException("invalid player");
        if (game.CheckPlayerLeftTime(playerId, DateTime.UtcNow)) throw new CoreLogicException("time is not yet up");
        game.FinishGame(GameTerminationReason.Timeout, playerId);
        game.SetState(new FinishedGameState());
    }

    public void HandleResign(Game game, Guid playerId) 
    {
        if (playerId != game.WhitePlayerId && playerId != game.BlackPlayerId) throw new CoreLogicException("invalid player");
        game.FinishGame(GameTerminationReason.Resignation, playerId);
        game.SetState(new FinishedGameState());
    }

    public void HandleDisconnect(Game game, Guid playerId)
    {
        if (playerId != game.WhitePlayerId && playerId != game.BlackPlayerId) throw new CoreLogicException("invalid player");
        game.FinishGame(GameTerminationReason.Disconnect, playerId);
        game.SetState(new FinishedGameState());
    }
}