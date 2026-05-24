using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Skins;
using Core.Models.Chess;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class SkinConfigurationMapper
{
    public static SkinConfiguration ToDomain(Guid userId, List<SkinConfigurationEntity> configurations)
    {
        Dictionary<FigureType, Guid> skins = [];
        foreach (var cfg in configurations) skins.Add((FigureType)cfg.Figure, cfg.SkinId);
        return new(userId, skins);
    }

    public static List<SkinConfigurationEntity> ToDb(SkinConfiguration configuration)
    {
        List<SkinConfigurationEntity> entities = [];
        foreach (var (figure, skinId) in configuration.UserFigureSkinIds) 
            entities.Add(SkinConfigurationEntity.Create(configuration.UserId, (int)figure, skinId));
        return entities;
    }
}