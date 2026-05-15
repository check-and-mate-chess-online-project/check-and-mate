using Application.Abstractions.UnitOfWork;
using Application.Exceptions;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Skins;
using Core.Models.Chess;
using Core.Models.Users;

namespace Application.Orchestration.SkinConfigurations;

public class SkinConfigurationService(
    ISkinConfigurationRepository configurationRepos, 
    ISkinRepository skinRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : ISkinConfigurationService
{
    private readonly ISkinConfigurationRepository _configurationRepos = configurationRepos;
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<SkinConfigurationDto> GetConfigurationAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        SkinConfiguration configuration = await _configurationRepos.GetAsync(userId) ?? throw new InvalidOperationException($"configuration not exist");
        SkinConfigurationDto configurationDto = await SkinConfigurationMapper.ToDto(configuration, _skinRepos);
        return configurationDto;
    }

    public async Task AddDefaultConfigurationAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        SkinConfiguration configuration = new(userId, (await _skinRepos.GetDefaultsAsync()).ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Id));
        _configurationRepos.Add(configuration);
        await _uow.CommitChangesAsync();
    }

    public async Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        SkinConfiguration configuration = await _configurationRepos.GetAsync(userId) ?? throw new InvalidOperationException($"configuration not exist");
        if (await _skinRepos.GetAsync(skinId) == null) throw new InvalidOperationException($"skin {skinId} not exist");
        configuration.ChangeFigureSkin(figure, skinId);
        _configurationRepos.Update(configuration);
        await _uow.CommitChangesAsync();
    }
}