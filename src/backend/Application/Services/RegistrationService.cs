using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Security;
using Application.Abstractions.Tokens;
using Application.Orchestration.SkinConfigurations;
using Application.Orchestration.InputStringValidation;
using Application.Dtos;
using Application.Mappers;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Users;
using Application.Orchestration.UserSkins;
using Core.Exceptions;

namespace Application.Services;

public class RegistrationService(
    ITokenGenerator tokenGenerator, 
    IPasswordHasher hasher, 
    IUserRepository userRepos,
    ISkinConfigurationService skinConfigService,
    IUserSkinService userSkinService,
    IUnitOfWork uow,
    LoginValidator loginValidator,
    PasswordValidator passwordValidator,
    EmailValidator emailValidator) : IRegistrationService
{
    private readonly ITokenGenerator _tokenGenerator = tokenGenerator;
    private readonly IPasswordHasher _hasher = hasher;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly ISkinConfigurationService _skinConfigService = skinConfigService;
    private readonly IUserSkinService _userSkinService = userSkinService;
    private readonly IUnitOfWork _uow = uow;
    private readonly LoginValidator _loginValidator = loginValidator;
    private readonly PasswordValidator _passwordValidator = passwordValidator;
    private readonly EmailValidator _emailValidator = emailValidator;

    public async Task<AuthResultDto> RegisterAsync(string login, string password, string email, UserRole role)
    {
        _loginValidator.Check(login);
        _passwordValidator.Check(password);
        _emailValidator.Check(email);
        if (await _userRepos.GetAsync(login) != null) throw new ConflictException($"user {login} already exist");
        if (await _userRepos.GetByEmailAsync(email) != null) throw new ConflictException($"email {email} already taken");
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