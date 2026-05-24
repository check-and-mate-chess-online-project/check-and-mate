namespace Core.Models.Requests;

public class FriendRequest
{
    public Guid Id { get; }
    public Guid ReceiverId { get; }
    public Guid SenderId { get; }
    public FriendRequestState State { get; private set; }

    public FriendRequest(Guid senderId, Guid receiverId, FriendRequestState state)
        : this(Guid.NewGuid(), receiverId, senderId, state) {}

    private FriendRequest(Guid id, Guid senderId, Guid receiverId, FriendRequestState state)
    {
        Id = id;
        ReceiverId = receiverId;
        SenderId = senderId;
        State = state;
    }

    public static FriendRequest Restore(Guid id, Guid senderId, Guid receiverId, FriendRequestState state)
        => new(id, senderId, receiverId, state);

    public void ChangeState(FriendRequestState state) => State = state;
}