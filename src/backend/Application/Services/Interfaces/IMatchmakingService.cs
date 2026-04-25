using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IMatchmakingService
{
    Task<GameDto?> StartGameAsync(Guid userId, bool isEnabled, int initialTimeSec, int incrementPerMoveSec);
}