namespace Application.Services.Interfaces;

public interface ILootBoxPurchaseService
{
    Task BuyLootBoxesAsync(Guid userId, int count);
}