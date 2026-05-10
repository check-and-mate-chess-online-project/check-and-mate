using Application.Dtos;
using Core.Models.Games;

namespace Application.Mappers;

public static class MoveResultMapper
{
    public static MoveResultDto ToDto(MoveResult result, GameDto game) => new()
    {
        Status = result.Status,
        Game = game,
        IsGameOver = result.IsGameOver,
        TerminationReason = result.TerminationReason
    };
}