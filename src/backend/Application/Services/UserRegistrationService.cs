using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Security;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Users;

namespace Application.Services;

public class UserRegistrationService(IPasswordHasher hasher, IUserRepository userRepos, IUnitOfWork uow) : IUserRegistrationService
{
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<UserDto> RegisterAsync(string login, string password, string email, UserRole role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        if (await _userRepos.GetAsync(login) != null) throw new InvalidOperationException($"user {login} already exist");
        string passwordHash = _hasher.GetHash(password);
        User user = new(login, passwordHash, email, role);
        _userRepos.Add(user);
        await _uow.CommitChangesAsync();
        return UserMapper.GetDto(user);
    }
}