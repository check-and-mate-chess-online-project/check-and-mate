using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence.EfCore.Context;
using Core.Repositories;
using Core.Models.Skins;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class SkinSetRepository(AppDbContext context) : ISkinSetRepository
{
    private readonly AppDbContext _context = context;

    public async Task<SkinSet?> GetAsync(Guid skinSetId)
    {
        SkinSetEntity? skinSet = await _context.SkinSets.FirstOrDefaultAsync(ss => ss.Id == skinSetId);
        return skinSet != null ? SkinSetMapper.ToDomain(skinSet) : null;
    }

    public async Task<SkinSet?> GetAsync(string name)
    {
        SkinSetEntity? skinSet = await _context.SkinSets.FirstOrDefaultAsync(ss => ss.Name == name);
        return skinSet != null ? SkinSetMapper.ToDomain(skinSet) : null;
    }

    public async Task<List<SkinSet>> GetAllAsync()
    {
        List<SkinSetEntity> skinSets = await _context.SkinSets.ToListAsync();
        return [.. skinSets.Select(SkinSetMapper.ToDomain)];
    }

    public void Add(SkinSet skinSet) => _context.SkinSets.Add(SkinSetMapper.ToDb(skinSet));
}