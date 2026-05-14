using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Security;
using Application.Abstractions.Tokens;
using Application.Orchestration.SkinConfigurations;
using Application.Dtos;
using Application.Mappers;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Users;
using Application.Orchestration.UserSkins;

namespace Application.Services;

public class RegistrationService(
    ITokenGenerator tokenGenerator, 
    IPasswordHasher hasher, 
    IUserRepository userRepos,
    ISkinConfigurationService skinConfigService,
    IUserSkinService userSkinService,
    IUnitOfWork uow) : IRegistrationService
{
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly ISkinConfigurationService _skinConfigService = skinConfigService;
    private readonly IUserSkinService _userSkinService = userSkinService;
    private readonly IUnitOfWork _uow = uow;

    public async Task<AuthResultDto> RegisterAsync(string login, string password, string email, UserRole role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        if (await _userRepos.GetAsync(login) != null) throw new ConflictException($"user {login} already exist");
        string passwordHash = _hasher.GetHash(password);
        User user = new(login, passwordHash, email, role);
        _userRepos.Add(user);
        await _skinConfigService.AddDefaultConfigurationAsync(user.Id);
        await _userSkinService.AddDefaultSkinsAsync(user.Id);
        await _uow.CommitChangesAsync();
        string token = _tokenGenerator.GenerateToken(user.Id, login);
        UserDto userDto = UserMapper.ToDto(user);
        AuthResultDto result = new() { User = userDto, Token = token };
        return result;
    }
}