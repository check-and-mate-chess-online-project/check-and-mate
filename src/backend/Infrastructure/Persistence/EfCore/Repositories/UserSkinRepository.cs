using Core.Repositories;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class UserSkinRepository(AppDbContext context) : IUserSkinRepository
{
    private readonly AppDbContext _context = context;

    public async Task<bool> ContainsAsync(Guid userId, Guid skinId)
    {
        return await _context.UserSkins.AnyAsync(us => us.UserId == userId && us.SkinId == skinId);
    }

    public async Task<List<Guid>> GetUserSkinIdsAsync(Guid userId)
    {
        List<Guid> skinIds = await _context.UserSkins
            .Where(us => us.UserId == userId)
            .Select(us => us.SkinId)
            .ToListAsync();
        return skinIds;
    }

    public void Add(Guid userId, Guid skinId) => _context.UserSkins.Add(UserSkinEntity.Create(userId, skinId));
}