namespace Infrastructure.Persistence.EfCore.Entities;

public class FriendEntity
{
    public Guid UserId { get; private set; }
    public Guid FriendId { get; private set; }

    public UserEntity User { get; private set; } = null!;
    public UserEntity Friend { get; private set; } = null!;

    private FriendEntity() { }
}