namespace Core.Repositories;

public interface IUserSkinRepository
{
    Task<List<Guid>> GetUserSkinIdsAsync(Guid userId);
    void Add(Guid userId, Guid skinId);
}