using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.Events;

namespace Application.Orchestration.EventHandlers;

public class GameTimeoutHandler(IGameplayService gameplayService, IUnitOfWork uow)
{
    private readonly IGameplayService _gameplayService = gameplayService;
    private readonly IUnitOfWork _uow = uow;

    public async Task Handle(TimeExpired e)
    {
        await _gameplayService.HandleTimeoutAsync(e.GameId, e.UserId);
        await _uow.CommitChangesAsync();
    }
}