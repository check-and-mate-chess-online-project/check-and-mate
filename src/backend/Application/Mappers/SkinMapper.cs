using Application.Dtos;
using Core.Models.Skins;

namespace Application.Mappers;

public static class SkinMapper
{
    public static SkinDto ToDto(Skin skin) => new()
    {
        Id = skin.Id,
        SetId = skin.SetId,
        Figure = skin.Figure,
        Rarity = skin.Rarity,
        WhiteImage = skin.WhiteImage,
        BlackImage = skin.BlackImage,
        IsDefault = skin.IsDefault
    };
}