using Core.Models.Games;

namespace Application.Dtos;

public class GameDto
{
    public Guid Id { get; set; }
    public UserPublicDto WhitePlayer { get; set; } = null!;
    public UserPublicDto BlackPlayer { get; set; } = null!;
    public GameResult? Result { get; set; }
    public GameTerminationReason? TerminationReason { get; set; }
    public DateTime? StartTimeUtc { get; set; }
    public DateTime? EndTimeUtc { get; set; }
    public bool TimeControlIsEnabled { get; set; }
    public int? InitialTimeSec { get; set; }
    public int? IncrementPerMoveSec { get; set; }
    public List<FigureDto> Figures { get; set; } = null!;
    public List<PlyDto> Moves { get; set; } = null!;
}