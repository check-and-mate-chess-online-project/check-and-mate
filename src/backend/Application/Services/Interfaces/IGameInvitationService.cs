using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IGameInvitationService
{
    Task<List<GameInvitationDto>> GetAllGameInvitationsAsync(Guid userId);
    Task<GameInvitationDto> SendGameInvitationAsync(Guid senderId, Guid receiverId, bool TimeControlIsEnabled, int initialTimeSec, int incrementPerMoveSec);
    Task<GameInvitationDto> AcceptGameInvitationAsync(Guid invitationId);
    Task<GameInvitationDto> RejectGameInvitationAsync(Guid invitationId);
}