using Application.Dtos;
using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface ISkinConfigurationService
{
    Task<UserConfigurationDto> GetConfigurationAsync(Guid userId);
    Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}