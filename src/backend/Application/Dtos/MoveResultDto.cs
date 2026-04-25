using Core.Models.Games;

namespace Application.Dtos;

public class MoveResultDto
{
    public bool IsApply { get; init; }
    public bool? IsValid { get; init; }
    public bool IsGameOver { get; init; }
    public GameTerminationReason? TerminationReason { get; init; }
}