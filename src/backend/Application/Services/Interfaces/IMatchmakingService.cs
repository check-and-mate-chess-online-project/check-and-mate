namespace Application.Services.Interfaces;

public interface IMatchmakingService
{
    Task StartOpponentSearchAsync(Guid userId, bool timeControlEnabled, int initialTimeSec, int incrementPerMoveSec);
    Task StopOpponentSearchAsync(Guid userId);
}