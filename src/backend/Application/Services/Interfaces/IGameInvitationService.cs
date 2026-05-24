using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IGameInvitationService
{
    Task<List<GameInvitationDto>> GetPendingGameInvitationsAsync(Guid userId);
    Task<GameInvitationDto> SendGameInvitationAsync(
        Guid senderId, 
        string receiverLogin, 
        bool timeControlIsEnabled, 
        int initialTimeSec, 
        int incrementPerMoveSec);
    Task<GameInvitationDto> AcceptGameInvitationAsync(Guid userId, Guid invitationId);
    Task<GameInvitationDto> RejectGameInvitationAsync(Guid userId, Guid invitationId);
}