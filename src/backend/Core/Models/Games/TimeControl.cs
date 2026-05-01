using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class TimeControl : ITimeControl
{
    public bool IsEnabled { get; } = true;
    public int InitialTimeSec { get; }
    public int IncrementPerMoveSec { get; }
    private double _whiteTimeLeftSec;
    private double _blackTimeLeftSec;
    private DateTime _whiteLastMoveStartTimeUtc;
    private DateTime _blackLastMoveStartTimeUtc;

    public TimeControl(int initialTimeSec, int incrementPerMoveSec)
    {
        if (initialTimeSec <= 0) throw new ArgumentException("initial time must be positive");
        if (incrementPerMoveSec < 0) throw new ArgumentException("increment must not be negative");
        InitialTimeSec = initialTimeSec;
        IncrementPerMoveSec = incrementPerMoveSec;
        _whiteTimeLeftSec = initialTimeSec;
        _blackTimeLeftSec = initialTimeSec;
    }

    public void SetMoveStartTime(PlayerColor color, DateTime currentTime)
    {
        if (color == PlayerColor.White) _whiteLastMoveStartTimeUtc = currentTime;
        else _blackLastMoveStartTimeUtc = currentTime;
    }

    public void UpdateTime(PlayerColor color, DateTime currentTime)
    {
        if (color == PlayerColor.White) Update(ref _whiteLastMoveStartTimeUtc, ref _whiteTimeLeftSec, currentTime);
        else Update(ref _blackLastMoveStartTimeUtc, ref _blackTimeLeftSec, currentTime);
    }

    public bool CheckLeftTime(PlayerColor color, DateTime currentTime)
    {
        return color == PlayerColor.White 
            ? Check(_whiteLastMoveStartTimeUtc, _whiteTimeLeftSec, currentTime)
            : Check(_blackLastMoveStartTimeUtc, _blackTimeLeftSec, currentTime);
    }

    private void Update(ref DateTime lastMove, ref double timeLeft, DateTime currentTime)
    {
        double spent = (currentTime - lastMove).TotalSeconds;
        timeLeft = timeLeft - spent + IncrementPerMoveSec;
        lastMove = currentTime;
    }

    private bool Check(DateTime lastMove, double timeLeft, DateTime currentTime) => timeLeft > (currentTime - lastMove).TotalSeconds;
}