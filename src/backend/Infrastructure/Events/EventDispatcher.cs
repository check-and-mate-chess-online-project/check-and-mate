using Application.Abstractions.Events;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Events;

public class EventDispatcher(IServiceProvider provider) : IEventDispatcher
{
    private readonly IServiceProvider _provider = provider;

    public async Task PublishAsync<TEvent>(TEvent e)
    {
        IEnumerable<IEventHandler<TEvent>> handlers = _provider.GetServices<IEventHandler<TEvent>>();
        foreach (var handler in handlers) await handler.Handle(e);
    }
}