using Application.Dtos;
using Core.Models.Chess;

namespace Application.Orchestration.SkinConfigurations;

public interface ISkinConfigurationService
{
    Task<SkinConfigurationDto> GetConfigurationAsync(Guid userId);
    Task AddDefaultConfigurationAsync(Guid userId);
    Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}