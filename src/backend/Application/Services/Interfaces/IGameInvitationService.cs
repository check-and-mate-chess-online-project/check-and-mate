namespace Application.Services.Interfaces;

public interface IGameInvitationService
{
    Task SendGameInvitationAsync(Guid senderId, Guid userId, int initialTimeSec, int incrementPerMoveSec);
    Task AcceptGameInvitationAsync(Guid invitationId);
    Task RejectGameInvitationAsync(Guid invitationId);
}