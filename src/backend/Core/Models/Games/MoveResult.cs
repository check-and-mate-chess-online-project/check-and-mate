namespace Core.Models.Games;

public class MoveResult(MoveAttemptStatus status, GameTerminationReason? terminationResult)
{
    public MoveAttemptStatus Status { get; } = status;
    public bool IsGameOver => TerminationReason.HasValue;
    public GameTerminationReason? TerminationReason { get; } = terminationResult;
}