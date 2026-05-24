using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Chess;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class SkinRepository(AppDbContext context) : ISkinRepository
{
    private readonly AppDbContext _context = context;

    public async Task<Skin?> GetAsync(Guid skinId)
    {
        SkinEntity? skin = await _context.Skins.FirstOrDefaultAsync(s => s.Id == skinId);
        return skin != null ? SkinMapper.ToDomain(skin) : null;
    }

    public async Task<Dictionary<FigureType, Skin>> GetDefaultsAsync()
    {
        Dictionary<FigureType, Skin> defaultSkins = [];
        List<SkinEntity> skins = await _context.Skins.Where(s => s.IsDefault == true).ToListAsync();
        foreach (var skin in skins)
        {
            if (defaultSkins.ContainsKey((FigureType)skin.Figure))
                throw new InvalidOperationException("there can only be one default skin per figure");
            defaultSkins[(FigureType)skin.Figure] = SkinMapper.ToDomain(skin);
        }
        return defaultSkins;
    }

    public async Task<List<Skin>> GetByRarityAsync(SkinRarity rarity)
    {
        List<SkinEntity> skins = await _context.Skins
            .Where(s => s.Rarity == (int)rarity)
            .ToListAsync();
        return [.. skins.Select(SkinMapper.ToDomain)];
    }

    public async Task<List<Skin>> GetAllAsync()
    {
        List<SkinEntity> skins = await _context.Skins.ToListAsync();
        return [.. skins.Select(SkinMapper.ToDomain)];
    }

    public void Add(Skin skin) => _context.Skins.Add(SkinMapper.ToDb(skin));
}