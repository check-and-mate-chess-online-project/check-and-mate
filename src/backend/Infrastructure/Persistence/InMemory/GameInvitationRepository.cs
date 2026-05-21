using Core.Repositories;
using Core.Models.Requests;

namespace Infrastructure.Persistence.InMemory;

public class GameInvitationRepository : IGameInvitationRepository
{
    private readonly List<GameInvitation> _invitations = new();
    private readonly Lock _lock = new();

    public Task<GameInvitation?> GetAsync(Guid invitationId)
    {
        lock (_lock)
            return Task.FromResult(_invitations.FirstOrDefault(i => i.Id == invitationId));
    }

    public Task<GameInvitation?> GetPendingAsync(Guid senderId, Guid receiverId)
    {
        lock (_lock)
            return Task.FromResult(_invitations.FirstOrDefault(i =>
                i.SenderId == senderId && 
                i.ReceiverId == receiverId && 
                i.State == GameInvitationState.Pending));
    }

    public Task<List<GameInvitation>> GetByUserAsync(Guid userId)
    {
        lock (_lock)
            return Task.FromResult(_invitations
                .Where(i => i.SenderId == userId || i.ReceiverId == userId)
                .ToList());
    }

    public Task<List<GameInvitation>> GetPendingByUserAsync(Guid userId)
    {
        lock (_lock)
            return Task.FromResult(_invitations
                .Where(i => i.State == GameInvitationState.Pending && (i.SenderId == userId || i.ReceiverId == userId))
                .ToList());
    }

    public void Add(GameInvitation invitation)
    {
        lock (_lock) _invitations.Add(invitation);
    }

    public Task Update(GameInvitation invitation)
    {
        lock (_lock)
        {
            var index = _invitations.FindIndex(i => i.Id == invitation.Id);
            if (index != -1) _invitations[index] = invitation;
        }
        return Task.CompletedTask;
    }
}