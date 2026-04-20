using Application.Services.Interfaces;
using Application.Abstractions.Security;
using Application.Abstractions.UnitOfWork;
using Core.Repositories;
using Core.Models.Users;

namespace Application.Services;

public class UserSettingsService(IUserRepository userRepos, IPasswordHasher hasher, IUnitOfWork uow) : IUserSettingsService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUnitOfWork _uow = uow;

    public async Task ChangeUserLoginAsync(Guid userId, string login)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        user.ChangeLogin(login);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    public async Task ChangeUserPasswordAsync(Guid userId, string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        string passworHash = _hasher.GetHash(password);
        user.ChangePasswordHash(passworHash);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    public async Task ChangeUserEmailAsync(Guid userId, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user not {userId} exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        user.ChangeEmail(email);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    public async Task RemoveUserAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} already deleted");
        _userRepos.Remove(user);
        await _uow.CommitChangesAsync();
    }
}