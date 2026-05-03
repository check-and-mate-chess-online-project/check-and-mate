using System.Collections.Concurrent;
using Core.Repositories;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class UserCustomizationRepository : IUserCustomizationRepository
{
    private readonly ConcurrentDictionary<Guid, UserCustomization> _store = new();

    public Task<UserCustomization?> GetAsync(Guid userId)
    {
        _store.TryGetValue(userId, out var customization);
        return Task.FromResult(customization);
    }

    public void Add(UserCustomization userCustomization) => _store[userCustomization.UserId] = userCustomization;

    public void Update(UserCustomization userCustomization) => _store[userCustomization.UserId] = userCustomization;
}