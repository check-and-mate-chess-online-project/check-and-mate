using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Repositories;
using Core.Models.Users;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class FriendshipRepository(AppDbContext context) : IFriendshipRepository
{
    private readonly AppDbContext _context = context;

    public async Task<Friendship?> GetAsync(Guid friendAId, Guid friendBId)
    {
        FriendshipEntity? friendship = await _context.Friends.FirstOrDefaultAsync(f => f.UserId == friendAId && f.FriendId == friendBId);
        return friendship != null ? FriendshipMapper.ToDomain(friendship) : null;
    }

    public async Task<List<Guid>> GetByUserAsync(Guid userId)
    {
        List<Guid> friendIds = await _context.Friends
            .Where(f => f.UserId == userId || f.FriendId == userId)
            .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
            .Distinct()
            .ToListAsync();
        return friendIds;
    }

    public void Add(Friendship friendship) => _context.Friends.Add(FriendshipMapper.ToDb(friendship));

    public void Remove(Friendship friendship)
    {
        FriendshipEntity entity = FriendshipMapper.ToDb(friendship);
        EntityEntry<FriendshipEntity>? trackedEntry = _context.ChangeTracker.Entries<FriendshipEntity>()
            .FirstOrDefault(e => e.Entity.UserId == entity.UserId && e.Entity.FriendId == entity.FriendId);
        if (trackedEntry != null)
        {
            _context.Friends.Remove(trackedEntry.Entity);
        }
        else
        {
            _context.Friends.Attach(entity);
            _context.Friends.Remove(entity);
        }
    }
}