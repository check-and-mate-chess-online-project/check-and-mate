using System.Collections.Concurrent;
using Core.Repositories;
using Core.Models.Skins;

namespace Infrastructure.Persistence.InMemory;

public class SkinConfigurationRepository : ISkinConfigurationRepository
{
    private readonly ConcurrentDictionary<Guid, SkinConfiguration> _store = new();

    public Task<SkinConfiguration?> GetAsync(Guid userId)
    {
        _store.TryGetValue(userId, out var configuration);
        return Task.FromResult(configuration);
    }

    public void Add(SkinConfiguration skinConfiguration) => _store[skinConfiguration.UserId] = skinConfiguration;

    public void Update(SkinConfiguration skinConfiguration) => _store[skinConfiguration.UserId] = skinConfiguration;
}