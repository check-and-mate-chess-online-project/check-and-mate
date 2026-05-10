using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IArchiveService
{
    Task<List<GameDto>> GetGameHistory(Guid userId);
}