namespace Presentation.Requests;

public record FriendRequest(Guid? ReceiverId, string? ReceiverLogin);