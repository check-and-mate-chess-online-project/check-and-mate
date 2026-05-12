using Application.Services.Interfaces;
using Application.Abstractions.Security;
using Application.Abstractions.Tokens;
using Application.Mappers;
using Application.Exceptions;
using Application.Dtos;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Services;

public class AuthService(ITokenGenerator tokenGenerator, IPasswordHasher hasher, IUserRepository userRepos) : IAuthService
{
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUserRepository _userRepos = userRepos;

    public async Task<AuthResultDto> Authorize(string login, string password)
    {
        User? user = await _userRepos.GetAsync(login);
        if (user == null || !_hasher.VerifyPassword(password, user.PasswordHash))
            throw new UnauthorizedAccessException("incorrect login or password");
        if (user.IsDeleted) throw new UserDeletedException($"user {user.Id} is deleted");
        string token = _tokenGenerator.GenerateToken(user.Id, login);
        UserDto userDto =  UserMapper.ToDto(user);
        AuthResultDto result = new() { User = userDto, Token = token };
        return result;
    }
}