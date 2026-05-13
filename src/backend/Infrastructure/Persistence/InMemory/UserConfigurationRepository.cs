using System.Collections.Concurrent;
using Core.Repositories;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class UserConfigurationRepository : IUserConfigurationRepository
{
    private readonly ConcurrentDictionary<Guid, UserConfiguration> _store = new();

    public Task<UserConfiguration?> GetAsync(Guid userId)
    {
        _store.TryGetValue(userId, out var configuration);
        return Task.FromResult(configuration);
    }

    public void Add(UserConfiguration userConfiguration) => _store[userConfiguration.UserId] = userConfiguration;

    public void Update(UserConfiguration userConfiguration) => _store[userConfiguration.UserId] = userConfiguration;
}