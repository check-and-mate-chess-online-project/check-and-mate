using Application.Dtos;
using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface IInventoryService
{
    Task<List<SkinDto>> GetUserSkinsAsync(Guid userId);
    Task<List<SkinDto>> GetUserSkinsAsync(string login);
    Task<SkinConfigurationDto> GetConfigurationAsync(Guid userId);
    Task ChangeFigureSkinAsync(Guid userId, FigureType figure, Guid skinId);
}