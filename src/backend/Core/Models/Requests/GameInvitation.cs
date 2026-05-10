using Core.Models.Interfaces;

namespace Core.Models.Requests;

public class GameInvitation(Guid senderId, Guid receiverId, ITimeControl timeControl, GameInvitationState state)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid ReceiverId { get; } = receiverId;
    public Guid SenderId { get; } = senderId;
    public ITimeControl TimeControl { get; } = timeControl;
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;
    public DateTime ExpiresAt { get; } = DateTime.UtcNow.AddSeconds(60);
    public GameInvitationState State { get; private set; } = state;

    public void ChangeState(GameInvitationState state) => State = state;
}