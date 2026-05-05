using Application.Dtos;

namespace Application.Services.Interfaces;

public interface ILootBoxService
{
    Task<LootBoxDropResultDto> OpenUserLootBoxAsync(Guid userId);
    Task BuyLootBoxesAsync(Guid userId, int count);
}