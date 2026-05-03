using Application.Dtos;
using Core.Models.Skins;

namespace Application.Mappers;

public static class SkinMapper
{
    public static SkinDto GetDto(Skin skin) => new()
    {
        Id = skin.Id,
        SetId = skin.SetId,
        Figure = skin.Figure,
        Rarity = skin.Rarity,
        Image = skin.Image,
        IsDefault = skin.IsDefault
    };
}