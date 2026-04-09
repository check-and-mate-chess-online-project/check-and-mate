using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class ActiveGameState : IGameState
{
    public MoveResult MakeMove(Game game, Move move, int playerId)
    {
        if (playerId != game.GetCurrentPlayerId()) throw new InvalidOperationException("invalid player");
        DateTime currentTime = DateTime.UtcNow;
        if (!game.CheckPlayerLeftTime(playerId, currentTime)) 
        {
            game.FinishGame(GameTerminationReason.Timeout, playerId);
            game.SetState(new FinishedGameState());
            return new MoveResult(null, GameTerminationReason.Timeout);
        }
        ChessMoveResult result = game.ApplyMove(move);
        if (!result.IsValid) return new MoveResult(result, null);
        game.UpdatePlayerTime(playerId, currentTime);
        game.SetMoveStartTime(game.GetDefendingPlayerId(), currentTime);
        GameTerminationReason? terminationReason = null;
        if (result.IsGameOver)
        {
            terminationReason = result.TerminationReason!.Value == ChessGameTerminationReason.CheckMate 
                ? GameTerminationReason.CheckMate 
                : GameTerminationReason.StaleMate;
            game.FinishGame((GameTerminationReason)terminationReason, playerId);
            game.SetState(new FinishedGameState());
        }
        return new MoveResult(result, terminationReason);
    }

    public void HandleTimeout(Game game, int playerId)
    {
        if (playerId != game.GetCurrentPlayerId()) throw new InvalidOperationException("invalid player");
        if (game.CheckPlayerLeftTime(playerId, DateTime.UtcNow)) throw new InvalidOperationException("time is not yet up");
        game.FinishGame(GameTerminationReason.Timeout, playerId);
        game.SetState(new FinishedGameState());
    }

    public void HandleResign(Game game, int playerId) 
    {
        game.FinishGame(GameTerminationReason.Resignation, playerId);
        game.SetState(new FinishedGameState());
    }

    public void HandleDisconnect(Game game, int playerId)
    {
        game.FinishGame(GameTerminationReason.Disconnect, playerId);
        game.SetState(new FinishedGameState());
    }
}