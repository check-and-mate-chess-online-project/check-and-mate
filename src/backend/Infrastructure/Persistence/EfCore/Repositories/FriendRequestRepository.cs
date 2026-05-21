using Microsoft.EntityFrameworkCore;
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
        if (!await _context.FriendRequests.AnyAsync(fr => fr.Id == request.Id))
            throw new InvalidOperationException($"friend request {request.Id} not exist");
        FriendRequestEntity requestEntity = FriendRequestMapper.ToDb(request);
        _context.FriendRequests.Attach(requestEntity);
        _context.Entry(requestEntity).State = EntityState.Modified;
    }
}