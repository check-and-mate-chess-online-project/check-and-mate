namespace Core.Models.NotificationPayloads;

public class GameInvitationPayload : INotificationPayloads
{
    public int SenderId { get; private set; }
    public GameInvitationState State { get; private set; }
}