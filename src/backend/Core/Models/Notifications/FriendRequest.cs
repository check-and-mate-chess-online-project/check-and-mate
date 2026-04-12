namespace Core.Models.Notifications;

public class FriendRequest : Notification
{
    public Guid SenderId { get; }
    public FriendRequestState State { get; private set; }

    public FriendRequest(Guid userId, Guid senderId, FriendRequestState state, bool isRead = false)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        SenderId = senderId;
        State = state;
        IsRead = isRead;
    }
}