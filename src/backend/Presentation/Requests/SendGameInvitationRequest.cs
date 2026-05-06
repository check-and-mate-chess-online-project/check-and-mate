namespace Presentation.Requests;

public record SendGameInvitationRequest(Guid ReceiverId, bool TimeControlIsEnabled, int InitialTimeSec, int IncrementPerMoveSec);