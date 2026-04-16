using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface IUserSkinConfigurationService
{
    Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}