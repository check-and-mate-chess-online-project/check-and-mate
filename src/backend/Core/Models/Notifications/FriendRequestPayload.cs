using Core.Models.Interfaces;

namespace Core.Models.Notifications;

public class NotificationPayloads : INotificationPayload
{
    public int SenderId { get; }
    public FriendRequestState State { get; }
}