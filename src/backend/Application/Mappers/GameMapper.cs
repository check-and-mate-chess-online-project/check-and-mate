using Application.Dtos;
using Core.Models.Games;

namespace Application.Mappers;

public static class GameMapper
{
    public static GameDto ToDto(Game game) => new()
    {
        Id = game.Id,
        WhitePlayerId = game.WhitePlayerId,
        BlackPlayerId = game.BlackPlayerId,
        Result = game.Result,
        TerminationReason = game.TerminationReason,
        StartTimeUtc = game.StartTimeUtc,
        EndTimeUtc = game.EndTimeUtc,
        InitialTimeSec = game.TimeControl.InitialTimeSec,
        IncrementPerMoveSec = game.TimeControl.IncrementPerMoveSec,
        Figures = [.. game.GetFigures().Select(FigureMapper.ToDto)]
    };
}