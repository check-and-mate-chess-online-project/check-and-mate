using Core.Models.Requests;

namespace Core.Repositories;

public interface IGameInvitationRepository
{
    Task<GameInvitation?> GetAsync(Guid invitationId);
    Task<GameInvitation?> GetPendingAsync(Guid senderId, Guid receiverId);
    Task<List<GameInvitation>> GetByUserAsync(Guid userId);
    Task<List<GameInvitation>> GetPendingByUserAsync(Guid userId);
    void Add(GameInvitation invitation);
    void Update(GameInvitation invitation);
}