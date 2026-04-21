using Core.Models.Skins;

namespace Application.Services.Interfaces;

public interface ILootBoxService
{
    Task<(Skin, bool)> OpenUserLootBoxAsync(Guid userId);
    Task BuyLootBoxesAsync(Guid userId, int count);
}