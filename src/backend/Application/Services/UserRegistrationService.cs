using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Users;

namespace Application.Services;

public class UserRegistrationService(IUserRepository userRepos, IUnitOfWork uow) : IUserRegistrationService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<UserDto> RegisterAsync(string login, string password, string email, UserRole role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        if (await _userRepos.GetAsync(login) != null) throw new InvalidOperationException($"user {login} already exist");
        User user = new(login, password, email, role);
        _userRepos.Add(user);
        await _uow.CommitChangesAsync();
        return UserMapper.GetDto(user);
    }
}