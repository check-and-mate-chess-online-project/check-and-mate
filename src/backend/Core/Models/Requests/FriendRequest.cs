namespace Core.Models.Requests;

public class FriendRequest(Guid senderId, Guid receiverId, FriendRequestState state)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid ReceiverId { get; } = receiverId;
    public Guid SenderId { get; } = senderId;
    public FriendRequestState State { get; private set; } = state;

    public void ChangeState(FriendRequestState state) => State = state;
}