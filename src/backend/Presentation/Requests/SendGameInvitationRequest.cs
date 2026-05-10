namespace Presentation.Requests;

public record SendGameInvitationRequest(Guid? ReceiverId, string? ReceiverLogin, bool TimeControlIsEnabled, int InitialTimeSec, int IncrementPerMoveSec);