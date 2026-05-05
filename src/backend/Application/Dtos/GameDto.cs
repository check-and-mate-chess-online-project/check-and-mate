using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Dtos;

public class GameDto
{
    public Guid Id { get; init; }
    public Guid WhitePlayerId { get; init; }
    public Guid BlackPlayerId { get; init; }
    public GameResult? Result { get; init; }
    public GameTerminationReason? TerminationReason { get; init; }
    public DateTime? StartTimeUtc { get; init; }
    public DateTime? EndTimeUtc { get; init; }
    public int? InitialTimeSec { get; init; }
    public int? IncrementPerMoveSec { get; init; }
    public List<(int A, int B, FigureType Figure, PlayerColor Color)> Figures { get; init; } = null!;
}