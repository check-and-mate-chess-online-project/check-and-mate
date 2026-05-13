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
        WhiteBoardImage = skin.WhiteBoardImage,
        BlackBoardImage = skin.BlackBoardImage,
        IdleImage = skin.IdleImage,
        StartFightWinImage = skin.StartFightWinImage,
        StartFightLoseImage = skin.StartFightLoseImage,
        EndFightWinImage = skin.EndFightWinImage,
        EndFightLoseImage = skin.EndFightLoseImage,
        IsDefault = skin.IsDefault
    };
}