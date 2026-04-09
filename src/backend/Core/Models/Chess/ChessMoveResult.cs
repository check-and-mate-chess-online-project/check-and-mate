namespace Core.Models.Chess;

public class ChessMoveResult(bool isValid, ChessGameTerminationReason? terminationReason = null)
{
    public bool IsValid { get; } = isValid;
    public bool IsGameOver => TerminationReason.HasValue;
    public ChessGameTerminationReason? TerminationReason { get; } = terminationReason;
}