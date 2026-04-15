using Core.Models.Skins;
using Core.Models.Chess;

namespace Core.Services.Interfaces;

public interface IUserCustomizationService
{
    Task<Skin?> GetUserFigureSkinAsync(Guid userId, FigureType figure);
    Task<List<Skin>> GetUserFigureSkinsAsync(Guid userId);
    Task InitializeUserFigureSkinsAsync(Guid userId, Dictionary<FigureType, Guid> figureSkins);
    Task UpdateUserFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}