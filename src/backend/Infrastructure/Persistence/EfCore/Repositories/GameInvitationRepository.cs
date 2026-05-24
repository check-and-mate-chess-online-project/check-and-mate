using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Repositories;
using Core.Models.Requests;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class GameInvitationRepository(AppDbContext context) : IGameInvitationRepository
{
    private readonly AppDbContext _context = context;

    public async Task<GameInvitation?> GetAsync(Guid invitationId)
    {
        GameInvitationEntity? invitation = await _context.GameInvitations.FirstOrDefaultAsync(i => i.Id == invitationId);
        return invitation != null ? GameInvitationMapper.ToDomain(invitation) : null;
    }
    
    public async Task<GameInvitation?> GetPendingAsync(Guid senderId, Guid receiverId)
    {
        GameInvitationEntity? invitation = await _context.GameInvitations
            .FirstOrDefaultAsync(i => i.SenderId == senderId && i.ReceiverId == receiverId);
        return invitation != null ? GameInvitationMapper.ToDomain(invitation) : null;
    }

    public async Task<List<GameInvitation>> GetByUserAsync(Guid userId)
    {
        List<GameInvitationEntity>? invitation = await _context.GameInvitations
            .Where(i => i.SenderId == userId || i.ReceiverId == userId)
            .ToListAsync();
        return [.. invitation.Select(GameInvitationMapper.ToDomain)];
    }
    
    public async Task<List<GameInvitation>> GetPendingByUserAsync(Guid userId)
    {
        List<GameInvitationEntity>? invitation = await _context.GameInvitations
            .Where(i => (i.SenderId == userId || i.ReceiverId == userId) && i.State == (int)GameInvitationState.Pending)
            .ToListAsync();
        return [.. invitation.Select(GameInvitationMapper.ToDomain)];
    }

    public async void Add(GameInvitation invitation) => _context.GameInvitations.Add(GameInvitationMapper.ToDb(invitation));

    public async Task Update(GameInvitation invitation)
    {
        GameInvitationEntity entity = GameInvitationMapper.ToDb(invitation);
        EntityEntry<GameInvitationEntity>? existingEntry = _context.ChangeTracker.Entries<GameInvitationEntity>()
            .FirstOrDefault(e => e.Entity.Id == entity.Id);
        if (existingEntry != null)
        {
            existingEntry.CurrentValues.SetValues(entity);
        }
        else
        {
            _context.GameInvitations.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }
    }
}