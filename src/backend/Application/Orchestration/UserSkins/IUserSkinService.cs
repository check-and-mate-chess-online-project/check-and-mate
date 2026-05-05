using Core.Models.Skins;

namespace Application.Orchestration.UserSkins;

public interface IUserSkinService
{
    Task<List<Skin>> GetUserSkinsAsync(Guid userId);
    Task<bool> TryAddSkinAsync(Guid userId, Guid skinId);
}