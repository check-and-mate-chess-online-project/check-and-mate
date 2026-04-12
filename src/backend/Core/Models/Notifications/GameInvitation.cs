namespace Core.Models.Notifications;

public class GameInvitation : Notification
{
    public Guid SenderId { get; }
    public GameInvitationState State { get; private set; }

    public GameInvitation(Guid userId, Guid senderId, GameInvitationState state, bool isRead = false)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        SenderId = senderId;
        State = state;
        IsRead = isRead;
    }
}