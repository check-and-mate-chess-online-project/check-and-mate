namespace Core.Models.Users;

public class Friendship
{
    public Guid UserId { get; }
    public Guid FriendId { get; }

    public Friendship(Guid userId, Guid friendId)
    {
        if (userId == friendId) throw new ArgumentException("users must be different"); 
        UserId = userId < friendId ? userId : friendId;
        FriendId = userId < friendId ? friendId : userId;
    }
}