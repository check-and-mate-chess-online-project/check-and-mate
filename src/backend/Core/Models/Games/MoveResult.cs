using Core.Models.Chess;

namespace Core.Models.Games;

public class MoveResult(ChessMoveResult? outcome, GameTerminationReason? terminationResult)
{
    public bool IsApply => Outcome != null;
    public ChessMoveResult? Outcome { get; } = outcome;
    public bool IsGameOver => TerminationReason.HasValue;
    public GameTerminationReason? TerminationReason { get; } = terminationResult;
}