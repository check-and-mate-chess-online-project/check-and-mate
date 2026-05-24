using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Chess;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class SkinConfigurationRepository(AppDbContext context) : ISkinConfigurationRepository
{
    private readonly AppDbContext _context = context;

    public async Task<SkinConfiguration?> GetAsync(Guid userId)
    {
        List<SkinConfigurationEntity> configurations = await _context.SkinConfigurations
            .Where(sc => sc.UserId == userId)
            .ToListAsync();
        return SkinConfigurationMapper.ToDomain(userId, configurations);
    }

    public void Add(SkinConfiguration skinConfiguration)
    {
        List<SkinConfigurationEntity> entities = SkinConfigurationMapper.ToDb(skinConfiguration);
        foreach (var entity in entities) _context.SkinConfigurations.Add(entity);
    }

    public async Task Update(SkinConfiguration skinConfiguration)
    {
        Guid userId = skinConfiguration.UserId;
        IReadOnlyDictionary<FigureType, Guid> incomingMap = skinConfiguration.UserFigureSkinIds;
        List<SkinConfigurationEntity> trackedEntities = [.. _context.ChangeTracker.Entries<SkinConfigurationEntity>()
            .Where(e => e.Entity.UserId == userId)
            .Select(e => e.Entity)];
        List<SkinConfigurationEntity> currentEntities;
        if (trackedEntities.Any())
        {
            currentEntities = trackedEntities;
        }
        else
        {
            currentEntities = await _context.SkinConfigurations
                .Where(sc => sc.UserId == userId)
                .ToListAsync();
        }
        Dictionary<int, SkinConfigurationEntity> existingMap = currentEntities
            .ToDictionary(e => e.Figure, e => e);

        foreach (var entity in currentEntities.ToList())
        {
            if (!incomingMap.ContainsKey((FigureType)entity.Figure))
                _context.SkinConfigurations.Remove(entity);
        }

        foreach (var (figure, skinId) in incomingMap)
        {
            int figureInt = (int)figure;
            if (existingMap.TryGetValue(figureInt, out SkinConfigurationEntity? existingEntity))
            {
                if (existingEntity.SkinId != skinId)
                    existingEntity.ChangeFigureSkin(skinId);
            }
            else
            {
                SkinConfigurationEntity newEntity = SkinConfigurationEntity.Create(userId, figureInt, skinId);
                _context.SkinConfigurations.Add(newEntity);
            }
        }
    }
}