using Core.Models.Interfaces;

namespace Core.Models.Notifications;

public class GameInvitationPayload : INotificationPayload
{
    public int SenderId { get; }
    public GameInvitationState State { get; }
}