using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface ISkinConfigurationService
{
    Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}