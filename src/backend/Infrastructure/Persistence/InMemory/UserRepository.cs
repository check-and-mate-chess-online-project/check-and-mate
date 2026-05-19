using Core.Repositories;
using Core.Models.Users;

namespace Infrastructure.Persistence.InMemory;

public class UserRepository : IUserRepository
{
    private readonly Dictionary<Guid, User> _usersById = new();
    private readonly Dictionary<string, Guid> _usersByLogin = new();

    public Task<User?> GetAsync(Guid userId)
    {
        _usersById.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }

    public Task<User?> GetAsync(string login)
    {
        if (_usersByLogin.TryGetValue(login, out var userId))
        {
            _usersById.TryGetValue(userId, out var user);
            return Task.FromResult(user);
        }

        return Task.FromResult<User?>(null);
    }

    public Task<User?> GetByEmailAsync(string email)
    {
        return Task.FromResult(_usersById.Select(kvp => kvp.Value).FirstOrDefault(u => u.Email == email));
    }

    public void Add(User user)
    {
        _usersById[user.Id] = user;
        _usersByLogin[user.Login] = user.Id;
    }

    public void Update(User user)
    {
        if (!_usersById.ContainsKey(user.Id))
            return;

        _usersById[user.Id] = user;
        _usersByLogin[user.Login] = user.Id;
    }
}