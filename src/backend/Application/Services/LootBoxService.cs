using Application.Services.Interfaces;
using Application.Orchestration.SkinDrops;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Orchestration.UserSkins;
using Application.Exceptions;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Users;

namespace Application.Services;

public class LootBoxService(
    IGameSettingsProvider settings, 
    ISkinDropService skinSropService,
    IUserSkinService userSkinService,
    IUserRepository userRepos,
    IUnitOfWork uow) : ILootBoxService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly ISkinDropService _skinSropService = skinSropService;
    private readonly IUserSkinService _userSkinService = userSkinService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<LootBoxDropResultDto> OpenUserLootBoxAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        user.OpenLootBox();
        Skin skin = await _skinSropService.DropSkinAsync();
        bool isDuplicate;
        if (await _userSkinService.TryAddSkinAsync(user.Id, skin.Id))
        {
            isDuplicate = false;
        }
        else
        {
            isDuplicate = true;
            user.AddBalance(_settings.DuplicateSkinReward);
        }
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
        LootBoxDropResultDto dropResult = new() { Skin = SkinMapper.GetDto(skin), IsDuplicate = isDuplicate };
        return dropResult;
    }

    public async Task BuyLootBoxesAsync(Guid userId, int count)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        int totalPrice = _settings.LootBoxPrice * count;
        user.SpendBalance(totalPrice);
        user.AddLootBoxes(count);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }
}