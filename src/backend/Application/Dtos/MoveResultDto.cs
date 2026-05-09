using Core.Models.Games;

namespace Application.Dtos;

public class MoveResultDto
{
    public MoveAttemptStatus Status { get; init; }
    public GameDto Game { get; init; } = null!;
    public bool IsGameOver { get; init; }
    public GameTerminationReason? TerminationReason { get; init; }
}