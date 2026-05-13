using Application.Dtos;
using Application.Exceptions;
using Application.Mappers;
using Application.Orchestration.UserSkins;
using Application.Services.Interfaces;
using Core.Models.Skins;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Services;

public class InventoryService(IUserSkinService userSkinService, IUserRepository userRepos) : IInventoryService
{
    private readonly IUserSkinService _userSkinService = userSkinService;
    private readonly IUserRepository _userRepos = userRepos;

    public async Task<List<SkinDto>> GetUserSkinsAsync(Guid userId) => await GetSkinsAsync(userId);

    public async Task<List<SkinDto>> GetUserSkinsAsync(string login)
    {
        User user = await _userRepos.GetAsync(login) ?? throw new NotFoundException($"user {login} not found");
        return await GetSkinsAsync(user.Id);
    }

    private async Task<List<SkinDto>> GetSkinsAsync(Guid userId)
    {
        List<Skin> skins = await _userSkinService.GetUserSkinsAsync(userId);
        List<SkinDto> skinDtos = [];
        foreach (var skin in skins) skinDtos.Add(SkinMapper.ToDto(skin));
        return skinDtos;
    }
}