using Application.Dtos;
using Core.Models.Chess;
using Core.Models.Skins;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Mappers;

public static class UserConfigurationMapper
{
    public static async Task<UserConfigurationDto> ToDto(UserConfiguration configuration, ISkinRepository repos)
    {
        UserConfigurationDto configurationDto = new();
        IReadOnlyDictionary<FigureType, Guid> skinIds = configuration.UserFigureSkinIds;
        foreach (var kvp in skinIds)
        {
            FigureType figure = kvp.Key;
            Guid skinId = kvp.Value;
            Skin skin = await repos.GetAsync(skinId) ?? throw new InvalidOperationException($"skin {skinId} not exist");
            SkinDto skinDto = SkinMapper.ToDto(skin);
            configurationDto.UserFigureSkins.Add(figure, skinDto);
        }
        return configurationDto;
    }
}