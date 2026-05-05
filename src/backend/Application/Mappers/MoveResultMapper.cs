using Application.Dtos;
using Core.Models.Games;

namespace Application.Mappers;

public static class MoveResultMapper
{
    public static MoveResultDto GetDto(MoveResult result) => new()
    {
        IsApply = result.IsApply,
        IsValid = result.Outcome?.IsValid,
        IsGameOver = result.IsGameOver,
        TerminationReason = result.TerminationReason
    };
}