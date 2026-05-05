using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IUserInventoryService
{
    Task<List<SkinDto>> GetUserSkinsAsync(Guid userId);
}