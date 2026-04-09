using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class DisabledTimeControl : ITimeControl
{
    public void SetMoveStartTime(PlayerColor color, DateTime currentTime) {}

    public void UpdateTime(PlayerColor color, DateTime currentTime) {}

    public bool CheckLeftTime(PlayerColor color, DateTime currentTime) => true;
}