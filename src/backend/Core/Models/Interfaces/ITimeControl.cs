using Core.Models.Chess;

namespace Core.Models.Interfaces;

public interface ITimeControl
{
    bool IsEnabled { get; }
    int InitialTimeSec { get; }
    int IncrementPerMoveSec { get; }
    double WhiteTimeLeftSec { get; }
    double BlackTimeLeftSec { get; }
    void SetMoveStartTime(PlayerColor color, DateTime currentTime);
    void UpdateTime(PlayerColor color, DateTime currentTime);
    bool CheckLeftTime(PlayerColor color, DateTime currentTime);
}