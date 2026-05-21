namespace Infrastructure.Persistence.EfCore.Entities;

public class FriendRequestEntity
{
    public Guid Id { get; private set; }
    public Guid ReceiverId { get; private set; }
    public Guid SenderId { get; private set; }
    public int State { get; private set; }

    public UserEntity Receiver { get; private set; } = null!;
    public UserEntity Sender { get; private set; } = null!;

    private FriendRequestEntity() {}

    public static FriendRequestEntity Create(Guid id, Guid senderId, Guid receiverId, int state) => new()
    {
        Id = id,
        SenderId = senderId,
        ReceiverId = receiverId,
        State = state
    };
}