namespace Core.Models.NotificationPayloads;

public class NotificationPayloads : INotificationPayloads
{
    public int SenderId { get; private set; }
    public FriendRequestState State { get; private set; }
}