namespace Core.Services.Interfaces;

public interface IUserSkinService
{
    Task<List<Guid>> GetUserSkinIdsAsync(Guid userId);
    Task AddAsync(Guid userId, Guid skinId);
}