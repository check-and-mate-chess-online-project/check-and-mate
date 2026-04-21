using Application.Services.Interfaces;
using Application.Orchestration.Skins;
using Application.Abstractions.UnitOfWork;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Users;

namespace Application.Services;

public class LootBoxService(ISkinDropService skinSropService, IUserRepository userRepos, IUserSkinRepository userSkinRepos, IUnitOfWork uow) : ILootBoxService
{
    public int LootBoxPrice { get; } = 500;
    public int DuplicateReward { get; } = 100;
    private readonly ISkinDropService _skinSropService = skinSropService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUserSkinRepository _userSkinRepos = userSkinRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<(Skin, bool)> OpenUserLootBoxAsync(Guid userId)
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
            user.AddBalance(DuplicateReward);
        }
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
        return (skin, isDuplicate);
    }

    public async Task BuyLootBoxesAsync(Guid userId, int count)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        int totalPrice = LootBoxPrice * count;
        user.SpendBalance(totalPrice);
        user.AddLootBoxes(count);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }
}