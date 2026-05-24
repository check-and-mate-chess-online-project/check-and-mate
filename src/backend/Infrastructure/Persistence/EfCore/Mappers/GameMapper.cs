using System.Text.Json;
using Infrastructure.Chess;
using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Games;
using Core.Models.Interfaces;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class GameMapper
{
    public static Game ToDomain(GameEntity game)
    {
        List<PlyEntity> moves = game.Moves != null 
            ? JsonSerializer.Deserialize<List<PlyEntity>>(game.Moves) ?? throw new InvalidOperationException("moves deserialization error")
            : [];
        ITimeControl timeControl = game.InitialTimeSec != null && game.IncrementPerMoveSec != null
            ? new TimeControl((int)game.InitialTimeSec, (int)game.IncrementPerMoveSec)
            : new DisabledTimeControl();
        return Game.Restore(
            game.Id,
            game.WhitePlayerId,
            game.BlackPlayerId,
            new FinishedGameState(),
            (GameResult)game.Result,
            (GameTerminationReason)game.TerminationReason,
            game.StartTimeUtc,
            game.EndTimeUtc,
            timeControl,
            new ArchivedChessEngine(moves)
        );
    }

    public static GameEntity ToDb(Game game)
    {
        List<PlyEntity> moves = [.. game.GetMoves().Select(PlyMapper.ToDb)];
        return GameEntity.Create
        (
            game.Id,
            game.WhitePlayerId,
            game.BlackPlayerId,
            JsonSerializer.Serialize(moves),
            (int)(game.Result ?? throw new InvalidOperationException("game must be completed")),
            (int)(game.TerminationReason ?? throw new InvalidOperationException("game must be completed")),
            game.TimeControl.InitialTimeSec,
            game.TimeControl.IncrementPerMoveSec,
            game.StartTimeUtc ?? throw new InvalidOperationException("game must be completed"),
            game.EndTimeUtc ?? throw new InvalidOperationException("game must be completed")
        );
    }
}