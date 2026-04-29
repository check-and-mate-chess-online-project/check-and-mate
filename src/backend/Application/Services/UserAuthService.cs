using Application.Services.Interfaces;
using Application.Abstractions.Security;
using Application.Mappers;
using Application.Dtos;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Services;

public class UserAuthService(IPasswordHasher hasher, IUserRepository userRepos) : IUserAuthService
{
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUserRepository _userRepos = userRepos;

    public async Task<UserDto?> Authorize(string login, string password)
    {
        User? user = await _userRepos.GetAsync(login);
        if (user == null || user.PasswordHash != _hasher.GetHash(password)) return null;
        return UserMapper.GetDto(user);
    }
}