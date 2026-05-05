using Core.Models.Skins;
using Core.Models.Chess;

namespace Core.Repositories;

public interface ISkinRepository
{
    Task<Skin?> GetAsync(Guid skinId);
    Task<Dictionary<FigureType, Skin>> GetDefaultsAsync();
    Task<List<Skin>> GetByRarityAsync(SkinRarity rarity);
    Task<List<Skin>> GetAllAsync();
    void Add(Skin skin);
}