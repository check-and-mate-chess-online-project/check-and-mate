using Core.Models.Skins;

namespace Core.Repositories.Interfaces;

public interface ISkinRepository
{
    Task<Skin> GetAsync(Guid skinId);
    Task<List<Skin>> GetAllAsync();
    Task AddAsync(Skin skin);
}