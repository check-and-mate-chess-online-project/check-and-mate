using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Repositories;
using Core.Models.Requests;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class FriendRequestRepository(AppDbContext context) : IFriendRequestRepository
{
    private readonly AppDbContext _context = context;

    public async Task<FriendRequest?> GetAsync(Guid requestId)
    {
        FriendRequestEntity? friendRequest = await _context.FriendRequests.FirstOrDefaultAsync(fr => fr.Id == requestId);
        return friendRequest != null ? FriendRequestMapper.ToDomain(friendRequest) : null;
    }

    public async Task<FriendRequest?> GetPendingAsync(Guid senderId, Guid receiverId)
    {
        FriendRequestEntity? friendRequest = await _context.FriendRequests.FirstOrDefaultAsync(
            fr => fr.SenderId == senderId && fr.ReceiverId == receiverId && fr.State == (int)FriendRequestState.Pending);
        return friendRequest != null ? FriendRequestMapper.ToDomain(friendRequest) : null;
    }

    public async Task<List<FriendRequest>> GetByUserAsync(Guid userId)
    {
        List<FriendRequestEntity> friendRequests = await _context.FriendRequests
            .Where(fr => fr.SenderId == userId || fr.ReceiverId == userId)
            .ToListAsync();
        return [.. friendRequests.Select(FriendRequestMapper.ToDomain)];
    }

    public async Task<List<FriendRequest>> GetPendingByUserAsync(Guid userId)
    {
        List<FriendRequestEntity> friendRequests = await _context.FriendRequests
            .Where(fr => (fr.SenderId == userId || fr.ReceiverId == userId) && fr.State == (int)FriendRequestState.Pending)
            .ToListAsync();
        return [.. friendRequests.Select(FriendRequestMapper.ToDomain)];
    }

    public void Add(FriendRequest request) => _context.FriendRequests.Add(FriendRequestMapper.ToDb(request));

    public async Task Update(FriendRequest request)
    {
        FriendRequestEntity entity = FriendRequestMapper.ToDb(request);
        EntityEntry<FriendRequestEntity>? existingEntry = _context.ChangeTracker.Entries<FriendRequestEntity>()
            .FirstOrDefault(e => e.Entity.Id == entity.Id);
        if (existingEntry != null)
        {
            existingEntry.CurrentValues.SetValues(entity);
        }
        else
        {
            _context.FriendRequests.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }
    }
}