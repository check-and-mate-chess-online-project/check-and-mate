namespace Core.Repositories;

public interface IUserSkinRepository
{
    Task<bool> ContainsAsync(Guid userId, Guid skinId);
    Task<List<Guid>> GetUserSkinIdsAsync(Guid userId);
    void Add(Guid userId, Guid skinId);
}