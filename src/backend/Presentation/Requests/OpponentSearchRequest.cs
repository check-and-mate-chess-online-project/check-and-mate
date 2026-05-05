namespace Presentation.Requests;

public record SearchOpponentRequest(bool IsEnabled, int InitialTimeSec, int IncrementPerMoveSec);