namespace Core.Models;

public class Notification
{
    public int Id { get; private set; }
    public int UserId { get; private set; }
    public User User { get; private set; } = null!;
    public NotificationType Type { get; private set; }
    public bool IsRead { get; private set; }

    public Notification(User user, NotificationType type, bool isRead = false)
    {
        UserId = user.Id;
        User = user;
        Type = type;
        IsRead = isRead;   
    }

    private Notification() {}
}