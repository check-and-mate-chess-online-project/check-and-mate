namespace Application.Services.Interfaces;

public interface ILootBoxOpeningService
{
    Task OpenUserLootBoxAsync(Guid userId);
}