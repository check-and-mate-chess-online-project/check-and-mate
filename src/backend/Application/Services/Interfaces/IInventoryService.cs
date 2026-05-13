using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IInventoryService
{
    Task<List<SkinDto>> GetUserSkinsAsync(Guid userId);
    Task<List<SkinDto>> GetUserSkinsAsync(string login);
}