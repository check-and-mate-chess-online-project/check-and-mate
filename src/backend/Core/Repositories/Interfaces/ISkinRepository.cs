using Core.Models.Skins;
using Core.Models.Chess;

namespace Core.Repositories.Interfaces;

public interface ISkinRepository
{
    Task<Skin?> GetAsync(Guid skinId);
    Task<Dictionary<FigureType, Skin>> GetDefaultsAsync();
    Task<List<Skin>> GetAllAsync();
    void Add(Skin skin);
}