using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IGameInvitationService
{
    Task<GameInvitationDto> SendGameInvitationAsync(Guid senderId, Guid userId, bool TimeControlIsEnabled, int initialTimeSec, int incrementPerMoveSec);
    Task<GameDto> AcceptGameInvitationAsync(Guid invitationId);
    Task RejectGameInvitationAsync(Guid invitationId);
}