namespace Presentation.Requests;

public record SendGameInvitationRequest(string ReceiverLogin, bool TimeControlIsEnabled, int InitialTimeSec, int IncrementPerMoveSec);