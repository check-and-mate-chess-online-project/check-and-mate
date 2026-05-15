using System.Collections.Concurrent;
using Core.Models.Skins;
using Core.Repositories;

namespace Infrastructure.Persistence.InMemory;

public class SkinSetRepository : ISkinSetRepository
{
    private readonly ConcurrentDictionary<Guid, SkinSet> _store = [];

    public Task<SkinSet?> GetAsync(Guid skinSetId)
    {
        _store.TryGetValue(skinSetId, out var skinSet);
        return Task.FromResult(skinSet);
    }

    public Task<SkinSet?> GetAsync(string name)
    {
        var skinSet = _store.Values.FirstOrDefault(s => s.Name == name);
        return Task.FromResult(skinSet);
    }

    public Task<List<SkinSet>> GetAllAsync()
    {
        var allSets = _store.Values.ToList();
        return Task.FromResult(allSets);
    }

    public void Add(SkinSet skinSet)
    {
        _store[skinSet.Id] = skinSet;
    }
}