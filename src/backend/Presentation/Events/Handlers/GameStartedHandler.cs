using Application.Abstractions.Events;
using Application.Events;

namespace Presentation.Events.Handlers;

public class GameStartedHandler(INotifier notifier) : IEventHandler<GameStarted>
{
    private readonly INotifier _notifier = notifier;

    public async Task Handle(GameStarted e)
    {
        await _notifier.NotifyGameStartedAsync(e.Game);
    }
}