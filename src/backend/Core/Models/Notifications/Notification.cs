namespace Core.Models.Notifications;

public abstract class Notification
{
    public Guid Id { get; protected set; }
    public Guid UserId { get; protected set; }
    public bool IsRead { get; protected set; }

    internal void Read() => IsRead = true;
}