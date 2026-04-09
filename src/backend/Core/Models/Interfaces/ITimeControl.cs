using Core.Models.Chess;

namespace Core.Models.Interfaces;

public interface ITimeControl
{
    void SetMoveStartTime(PlayerColor color, DateTime currentTime);
    void UpdateTime(PlayerColor color, DateTime currentTime);
    bool CheckLeftTime(PlayerColor color, DateTime currentTime);
}