using Application.Abstractions.UnitOfWork;
using Application.Services.Interfaces;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Users;
using Application.Dtos;
using Application.Mappers;

namespace Application.Services;

public class SkinConfigurationService(
    IUserConfigurationRepository configurationRepos, 
    ISkinRepository skinRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : ISkinConfigurationService
{
    private readonly IUserConfigurationRepository _configurationRepos = configurationRepos;
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<UserConfigurationDto> GetConfigurationAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        UserConfiguration configuration = await _configurationRepos.GetAsync(userId) ?? throw new InvalidOperationException($"configuration not exist");
        UserConfigurationDto configurationDto = await UserConfigurationMapper.ToDto(configuration, _skinRepos);
        return configurationDto;
    }

    public async Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        UserConfiguration configuration = await _configurationRepos.GetAsync(userId) ?? throw new InvalidOperationException($"configuration not exist");
        if (await _skinRepos.GetAsync(skinId) == null) throw new InvalidOperationException($"skin {skinId} not exist");
        configuration.ChangeFigureSkin(figure, skinId);
        _configurationRepos.Update(configuration);
        await _uow.CommitChangesAsync();
    }
}