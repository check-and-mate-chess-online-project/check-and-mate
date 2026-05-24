using Core.Models.Interfaces;

namespace Core.Models.Requests;

public class GameInvitation
{
    public Guid Id { get; }
    public Guid SenderId { get; }
    public Guid ReceiverId { get; }
    public ITimeControl TimeControl { get; }
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public DateTime ExpiresAt { get; }
    public GameInvitationState State { get; private set; }

    public void ChangeState(GameInvitationState state) => State = state;

    public GameInvitation(Guid senderId, Guid receiverId, ITimeControl timeControl, GameInvitationState state)
        : this(Guid.NewGuid(), senderId, receiverId, timeControl, DateTime.UtcNow.AddSeconds(60), state) {}

    private GameInvitation(Guid id, Guid senderId, Guid receiverId, ITimeControl timeControl, DateTime expiresAt, GameInvitationState state)
    {
        Id = id;
        SenderId = senderId;
        ReceiverId = receiverId;
        TimeControl = timeControl;
        ExpiresAt = expiresAt;
        State = state;
    }

    public static GameInvitation Restore(
        Guid id, 
        Guid senderId, 
        Guid receiverId, 
        ITimeControl timeControl, 
        DateTime expiresAt, 
        GameInvitationState state) => new
        (
            id, senderId, receiverId, timeControl, expiresAt, state
        );
}