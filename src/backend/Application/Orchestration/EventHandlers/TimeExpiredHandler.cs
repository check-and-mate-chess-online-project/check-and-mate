using Application.Services.Interfaces;
using Application.Abstractions.Events;
using Application.Events;

namespace Application.Orchestration.EventHandlers;

public class TimeExpiredHandler(IGameplayService gameplayService) : IEventHandler<TimeExpired>
{
    private readonly IGameplayService _gameplayService = gameplayService;

    public async Task Handle(TimeExpired e)
    {
        await _gameplayService.HandleTimeoutAsync(e.UserId);
    }
}