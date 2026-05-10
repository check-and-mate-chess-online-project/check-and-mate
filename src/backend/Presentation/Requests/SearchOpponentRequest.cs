namespace Presentation.Requests;

public record SearchOpponentRequest(bool TimeControlIsEnabled, int InitialTimeSec, int IncrementPerMoveSec);