using Application.Services.Interfaces;
using Application.Abstractions.Security;
using Application.Abstractions.UnitOfWork;
using Application.Dtos;
using Application.Mappers;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Users;

namespace Application.Services;

public class ProfileService(IUserRepository userRepos, IPasswordHasher hasher, IUnitOfWork uow) : IProfileService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUnitOfWork _uow = uow;

    public async Task<UserDto> GetUserProfile(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        return UserMapper.GetDto(user);
    }

    public async Task UpdateUserAsync(Guid userId, string? login, string? email)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        if (login != null) await ChangeUserLoginAsync(user, login);
        if (email != null) await ChangeUserEmailAsync(user, email);
    }

    public async Task ChangeUserPasswordAsync(Guid userId, string password, string newPassword)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(newPassword);
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        if (user.PasswordHash != _hasher.GetHash(password)) throw new UnauthorizedAccessException("incorrect password");
        string passworHash = _hasher.GetHash(newPassword);
        user.ChangePasswordHash(passworHash);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    public async Task RemoveUserAsync(Guid userId, string password)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} already deleted");
        if (user.PasswordHash != _hasher.GetHash(password)) throw new UnauthorizedAccessException("incorrect password");
        user.Delete();
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    private async Task ChangeUserLoginAsync(User user, string login)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        user.ChangeLogin(login);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }

    private async Task ChangeUserEmailAsync(User user, string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        user.ChangeEmail(email);
        _userRepos.Update(user);
        await _uow.CommitChangesAsync();
    }
}