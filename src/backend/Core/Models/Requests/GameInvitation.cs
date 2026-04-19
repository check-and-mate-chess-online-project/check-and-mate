using Core.Models.Interfaces;

namespace Core.Models.Requests;

public class GameInvitation(Guid senderId, Guid userId, ITimeControl timeControl, GameInvitationState state)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid UserId { get; } = userId;
    public Guid SenderId { get; } = senderId;
    public ITimeControl TimeControl { get; } = timeControl;
    public GameInvitationState State { get; private set; } = state;

    public void ChangeState(GameInvitationState state) => State = state;
}