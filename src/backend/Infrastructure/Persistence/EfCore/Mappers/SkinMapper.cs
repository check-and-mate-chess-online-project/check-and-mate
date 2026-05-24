using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Chess;
using Core.Models.Skins;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class SkinMapper
{
    public static Skin ToDomain(SkinEntity skin)
    {
        return Skin.Restore
        (
            skin.Id,
            skin.SetId,
            skin.Name,
            skin.Description,
            (FigureType)skin.Figure,
            (SkinRarity)skin.Rarity,
            new SkinAssets(
                skin.WhiteBoardImage,
                skin.BlackBoardImage,
                skin.IdleImage,
                skin.StartFightWinImage,
                skin.StartFightLoseImage,
                skin.EndFightWinImage,
                skin.EndFightLoseImage),
            skin.IsDefault
        );
    }

    public static SkinEntity ToDb(Skin skin)
    {
        return SkinEntity.Create
        (
            skin.Id,
            skin.SetId,
            skin.Name,
            skin.Description,
            (int)skin.Figure,
            (int)skin.Rarity,
            skin.Assets.WhiteBoardImage,
            skin.Assets.BlackBoardImage,
            skin.Assets.IdleImage,
            skin.Assets.StartFightWinImage,
            skin.Assets.StartFightLoseImage,
            skin.Assets.EndFightWinImage,
            skin.Assets.EndFightLoseImage,
            skin.IsDefault
        );
    }
}