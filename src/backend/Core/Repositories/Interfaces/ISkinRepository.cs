using Core.Models.Skins;

namespace Core.Repositories.Interfaces;

public interface ISkinRepository
{
    Task<Skin?> GetAsync(Guid skinId);
    Task<List<Skin>> GetAllAsync();
    void Add(Skin skin);
}