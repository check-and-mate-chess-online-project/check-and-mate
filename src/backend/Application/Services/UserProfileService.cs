using Application.Services.Interfaces;
using Application.Abstractions.Security;
using Application.Abstractions.UnitOfWork;
using Application.Dtos;
using Core.Repositories;
using Core.Models.Users;
using Application.Mappers;

namespace Application.Services;

public class UserProfileService(IUserRepository userRepos, IPasswordHasher hasher, IUnitOfWork uow) : IUserProfileService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUnitOfWork _uow = uow;

    public async Task<UserDto> GetUserProfile(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        return UserMapper.GetDto(user);
    }

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
        user.Delete();
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }
}