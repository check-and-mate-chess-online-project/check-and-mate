using Core.Models.Games;

namespace Application.Dtos;

public class MoveResultDto
{
    public MoveAttemptStatus Status { get; set; }
    public GameDto Game { get; set; } = null!;
    public bool IsGameOver { get; set; }
    public GameTerminationReason? TerminationReason { get; set; }
}