using Core.Repositories.Interfaces;
using Core.Services.Interfaces;

namespace Core.Services;

public class UserSkinService(IUserSkinRepository userSkinRepos) : IUserSkinService
{
    private readonly IUserSkinRepository _userSkinRepos = userSkinRepos;

    public async Task<List<Guid>> GetUserSkinIdsAsync(Guid userId) => await _userSkinRepos.GetUserSkinIdsAsync(userId);

    public async Task AddUserSkinAsync(Guid userId, Guid skinId)
    {
        if (await _userSkinRepos.GetUserSkinIdsAsync(userId) != null) throw new InvalidOperationException("user already has the skin");
        _userSkinRepos.Add(userId, skinId);
    }
}