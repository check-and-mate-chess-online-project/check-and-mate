using System.Collections.Concurrent;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Chess;

namespace Infrastructure.Persistence.InMemory;

public class SkinRepository : ISkinRepository
{
    private readonly ConcurrentDictionary<Guid, Skin> _skins = new();

    public Task<Skin?> GetAsync(Guid skinId)
    {
        _skins.TryGetValue(skinId, out Skin? skin);
        return Task.FromResult(skin);
    }

    public Task<Dictionary<FigureType, Skin>> GetDefaultsAsync()
    {
        Dictionary<FigureType, Skin> defaults = _skins.Values
            .Where(s => s.IsDefault)
            .ToDictionary(s => s.Figure);
        return Task.FromResult(defaults);
    }

    public Task<List<Skin>> GetByRarityAsync(SkinRarity rarity)
    {
        List<Skin> skins = [.. _skins.Values.Where(s => s.Rarity == rarity)];
        return Task.FromResult(skins);
    }

    public Task<List<Skin>> GetAllAsync()
    {
        List<Skin> allSkins = [.. _skins.Values];
        return Task.FromResult(allSkins);
    }

    public void Add(Skin skin) => _skins[skin.Id] = skin;
}