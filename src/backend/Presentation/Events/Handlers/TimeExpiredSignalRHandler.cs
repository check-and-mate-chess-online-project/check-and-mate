using Application.Abstractions.Events;
using Application.Events;

namespace Presentation.Events.Handlers;

public class TimeExpiredSignalRHandler(INotifier notifier) : IEventHandler<TimeExpired>
{
    private readonly INotifier _notifier = notifier;

    public async Task Handle(TimeExpired e)
    {
        await _notifier.NotifyTimeExpiredAsync(e.GameId, e.UserId);
    }
}