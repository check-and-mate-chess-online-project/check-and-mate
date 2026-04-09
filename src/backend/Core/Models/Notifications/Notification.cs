using Core.Models.Interfaces;

namespace Core.Models.Notifications;

public class Notification(int userId, NotificationType type, INotificationPayload payload, bool isRead = false)
{
    public int Id { get; }
    public int UserId { get; } = userId;
    public NotificationType Type { get; } = type;
    public INotificationPayload Payload { get; } = payload;
    public bool IsRead { get; private set; } = isRead;

    internal void Read() => IsRead = true;
}