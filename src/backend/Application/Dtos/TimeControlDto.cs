namespace Application.Dtos;

public class TimeControlDto
{
    public bool IsEnabled { get; init; }
    public int InitialTimeSec { get; init; }
    public int IncrementPerMoveSec { get; init; }
}