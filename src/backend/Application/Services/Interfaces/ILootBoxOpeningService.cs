using Core.Models.Skins;

namespace Application.Services.Interfaces;

public interface ILootBoxOpeningService
{
    Task<Skin> OpenUserLootBoxAsync(Guid userId);
}