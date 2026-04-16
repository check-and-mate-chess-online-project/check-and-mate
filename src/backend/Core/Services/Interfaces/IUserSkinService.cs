namespace Core.Services.Interfaces;

public interface IUserSkinService
{
    Task<List<Guid>> GetUserSkinIdsAsync(Guid userId);
    Task AddUserSkinAsync(Guid userId, Guid skinId);
}