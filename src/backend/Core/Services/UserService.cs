using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Users;
using Core.Security;

namespace Core.Services;

public class UserService(IUserRepository userRepos, IPasswordHasher hasher) : IUserService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IPasswordHasher _hasher = hasher;

    public async Task<User?> GetUserAsync(Guid userId) => await _userRepos.GetAsync(userId);

    public async Task AddUserAsync(string login, string password, string email, UserRole role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        if (await _userRepos.GetAsync(login) != null) throw new InvalidOperationException("user already exist");
        User user = new(login, password, email, role);
        _userRepos.Add(user);
    }

    public async Task ChangeUserLoginAsync(Guid userId, string login)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException("user not exist");
        user.ChangeLogin(login);
        _userRepos.Update(user);
    }

    public async Task ChangeUserPasswordAsync(Guid userId, string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException("user not exist");
        string passworHash = _hasher.GetHash(password);
        user.ChangePasswordHash(passworHash);
        _userRepos.Update(user);
    }

    public async Task ChangeUserEmailAsync(Guid userId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException("user not exist");
        user.ChangeEmail(email);
        _userRepos.Update(user);
    }

    public async Task RemoveUserAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException("user not exist");
        _userRepos.Remove(user);
    }
}