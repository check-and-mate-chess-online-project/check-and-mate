using Core.Models.Chess;
using Core.Models.Users;

namespace Core.Services.Interfaces;

public interface IUserCustomizationService
{
    Task<UserCustomization?> GetUserCustomizationAsync(Guid userId);
    Task AddUserCustomizationAsync(Guid userId, Dictionary<FigureType, Guid> figureSkinIds);
    Task UpdateUserFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}