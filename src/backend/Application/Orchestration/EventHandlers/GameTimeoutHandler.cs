using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Events;
using Application.Events;

namespace Application.Orchestration.EventHandlers;

public class GameTimeoutHandler(IGameplayService gameplayService, IUnitOfWork uow) : IEventHandler<TimeExpired>
{
    private readonly IGameplayService _gameplayService = gameplayService;
    private readonly IUnitOfWork _uow = uow;

    public async Task Handle(TimeExpired e)
    {
        await _gameplayService.HandleTimeoutAsync(e.UserId);
        await _uow.CommitChangesAsync();
    }
}