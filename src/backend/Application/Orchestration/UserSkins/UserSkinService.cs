using Core.Models.Skins;
using Core.Models.Chess;
using Core.Repositories;

namespace Application.Orchestration.UserSkins;

public class UserSkinService(ISkinRepository skinRepos, IUserSkinRepository userSkinRepos) : IUserSkinService
{
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly IUserSkinRepository _userSkinRepos = userSkinRepos;

    public async Task<List<Skin>> GetUserSkinsAsync(Guid userId)
    {
        List<Guid> userSkinIds = await _userSkinRepos.GetUserSkinIdsAsync(userId);
        List<Skin> skins = [];
        foreach (var id in userSkinIds)
        {
            Skin skin = await _skinRepos.GetAsync(id) ?? throw new InvalidOperationException($"skin {id} not exist");
            skins.Add(skin);
        }
        return skins;
    }

    public async Task AddDefaultSkinsAsync(Guid userId)
    {
        Dictionary<FigureType, Skin> defaultSkins = await _skinRepos.GetDefaultsAsync();
        foreach (var kvp in defaultSkins)
        {
            await TryAddSkinAsync(userId, kvp.Value.Id);
        }
    }

    public async Task<bool> TryAddSkinAsync(Guid userId, Guid skinId)
    {
        if (await _userSkinRepos.ContainsAsync(userId, skinId)) return false;
        _userSkinRepos.Add(userId, skinId);
        return true;
    }
}