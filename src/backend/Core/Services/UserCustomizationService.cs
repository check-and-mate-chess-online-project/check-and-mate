using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Chess;
using Core.Models.Users;

namespace Core.Services;

public class UserCustomizationService(IUserCustomizationRepository userCustomizationRepos) : IUserCustomizationService
{
    private readonly IUserCustomizationRepository _userCustomizationRepos = userCustomizationRepos;

    public async Task<UserCustomization?> GetUserCustomizationAsync(Guid userId) => await _userCustomizationRepos.GetAsync(userId);

    public async Task AddUserCustomizationAsync(Guid userId, Dictionary<FigureType, Guid> figureSkinIds)
    {
        if (await _userCustomizationRepos.GetAsync(userId) != null) throw new InvalidOperationException("user customization already exist");
        UserCustomization customization = new(userId, figureSkinIds);
        _userCustomizationRepos.Add(customization);
    }

    public async Task UpdateUserFigureSkinAsync(Guid userId, FigureType figure, Guid skinId)
    {
        UserCustomization customization = await _userCustomizationRepos.GetAsync(userId) ?? throw new ArgumentException("user customization not exist");
        customization.ChangeFigureSkin(figure, skinId);
        _userCustomizationRepos.Update(customization);
    }
}