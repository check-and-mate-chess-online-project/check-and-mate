using Application.Dtos;
using Application.Mappers;
using Application.Orchestration.UserSkins;
using Application.Services.Interfaces;
using Core.Models.Skins;

namespace Application.Services;

public class UserInventoryService(IUserSkinService userSkinService) : IUserInventoryService
{
    private readonly IUserSkinService _userSkinService = userSkinService;

    public async Task<List<SkinDto>> GetUserSkinsAsync(Guid userId)
    {
        List<Skin> skins = await _userSkinService.GetUserSkinsAsync(userId);
        List<SkinDto> skinDtos = [];
        foreach (var skin in skins) skinDtos.Add(SkinMapper.GetDto(skin));
        return skinDtos;
    }
}