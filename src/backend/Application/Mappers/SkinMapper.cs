using Application.Dtos;
using Core.Models.Skins;

namespace Application.Mappers;

public static class SkinMapper
{
    public static SkinDto ToDto(Skin skin) => new()
    {
        Id = skin.Id,
        SetId = skin.SetId,
        Name = skin.Name,
        Description = skin.Description,
        Figure = skin.Figure,
        Rarity = skin.Rarity,
        Assets = skin.Assets,
        IsDefault = skin.IsDefault
    };
}