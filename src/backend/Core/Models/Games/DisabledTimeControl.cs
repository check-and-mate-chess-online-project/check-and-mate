using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class DisabledTimeControl : ITimeControl
{
    public bool IsEnabled { get; } = false;
    public int InitialTimeSec { get; } = 0;
    public int IncrementPerMoveSec { get; } = 0;
    public double WhiteTimeLeftSec { get; } = 0;
    public double BlackTimeLeftSec { get; } = 0;

    public void SetMoveStartTime(PlayerColor color, DateTime currentTime) {}

    public void UpdateTime(PlayerColor color, DateTime currentTime) {}

    public bool CheckLeftTime(PlayerColor color, DateTime currentTime) => true;
}