using Application.Services.Interfaces;
using Application.Orchestration.Skins;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Dtos;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Users;

namespace Application.Services;

public class LootBoxService(IGameSettingsProvider settings, ISkinDropService skinSropService, IUserRepository userRepos, IUserSkinRepository userSkinRepos, IUnitOfWork uow) : ILootBoxService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly ISkinDropService _skinSropService = skinSropService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUserSkinRepository _userSkinRepos = userSkinRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<LootBoxDropResultDto> OpenUserLootBoxAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        user.OpenLootBox();
        Skin skin = await _skinSropService.DropSkinAsync();
        bool isDuplicate;
        if (await _userRepos.GetAsync(skin.Id) == null)
        {
            isDuplicate = false;
            _userSkinRepos.Add(userId, skin.Id);
        }
        else
        {
            isDuplicate = true;
            user.AddBalance(_settings.DuplicateSkinReward);
        }
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
        LootBoxDropResultDto dropResult = new() { SkinId = skin.Id, IsDuplicate = isDuplicate };
        return dropResult;
    }

    public async Task BuyLootBoxesAsync(Guid userId, int count)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        int totalPrice = _settings.LootBoxPrice * count;
        user.SpendBalance(totalPrice);
        user.AddLootBoxes(count);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }
}