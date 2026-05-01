using Application.Abstractions.UnitOfWork;
using Application.Services.Interfaces;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Users;

namespace Application.Services;

public class UserSkinConfigurationService(
    IUserCustomizationRepository customizationRepos, 
    ISkinRepository skinRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IUserSkinConfigurationService
{
    private readonly IUserCustomizationRepository _customizationRepos = customizationRepos;
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        UserCustomization customization = await _customizationRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (await _skinRepos.GetAsync(skinId) == null) throw new NotFoundException($"skin {skinId} not found");
        customization.ChangeFigureSkin(figure, skinId);
        _customizationRepos.Update(customization);
        await _uow.CommitChangesAsync();
    }
}