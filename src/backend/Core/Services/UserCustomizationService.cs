using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Chess;
using Core.Models.Skins;

namespace Core.Services;

public class UserCustomizationService(IUserFigureSkinRepository userFigureSkinRepos) : IUserCustomizationService
{
    private readonly IUserFigureSkinRepository _userFigureSkinRepos = userFigureSkinRepos;

    public async Task<Skin?> GetUserFigureSkinAsync(Guid userId, FigureType figure) => await _userFigureSkinRepos.GetAsync(userId, figure);

    public async Task<List<Skin>> GetUserFigureSkinsAsync(Guid userId) => await _userFigureSkinRepos.GetByUserIdAsync(userId);

    public async Task InitializeUserFigureSkinsAsync(Guid userId, Dictionary<FigureType, Guid> figureSkins)
    {
        if ((await _userFigureSkinRepos.GetByUserIdAsync(userId)).Any()) throw new InvalidOperationException("figure skins already exist");
        _userFigureSkinRepos.Initialize(userId, figureSkins);
    }

    public async Task UpdateUserFigureSkinAsync(Guid userId, FigureType figure, Guid skinId)
    {
        if (await _userFigureSkinRepos.GetAsync(userId, figure) == null) throw new ArgumentException("figure skin not exist");
        _userFigureSkinRepos.Update(userId, figure, skinId);
    }
}