namespace Infrastructure.Persistence.EfCore.Entities;

public class FriendshipEntity
{
    public Guid UserId { get; private set; }
    public Guid FriendId { get; private set; }

    public UserEntity User { get; private set; } = null!;
    public UserEntity Friend { get; private set; } = null!;

    private FriendshipEntity() { }

    public static FriendshipEntity Create(Guid userId, Guid friendId) => new()
    {
        UserId = userId,
        FriendId = friendId
    };
}