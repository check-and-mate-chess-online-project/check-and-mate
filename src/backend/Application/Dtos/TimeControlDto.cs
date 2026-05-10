namespace Application.Dtos;

public class TimeControlDto
{
    public bool IsEnabled { get; set; }
    public int InitialTimeSec { get; set; }
    public int IncrementPerMoveSec { get; set; }
}