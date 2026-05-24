using Core.Models.Skins;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class SkinSetMapper
{
    public static SkinSet ToDomain(SkinSetEntity skinSet)
    {
        return SkinSet.Restore
        (
            skinSet.Id,
            skinSet.Name,
            skinSet.Description
        );
    }

    public static SkinSetEntity ToDb(SkinSet skinSet)
    {
        return SkinSetEntity.Create
        (
            skinSet.Id,
            skinSet.Name,
            skinSet.Description
        );
    }
}