using Application.Abstractions.Events;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Events;

public class EventDispatcher(IServiceScopeFactory scopeFactory) : IEventDispatcher
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    public async Task PublishAsync<TEvent>(TEvent e)
    {
        using IServiceScope scope = _scopeFactory.CreateScope();
        IEnumerable<IEventHandler<TEvent>> handlers = scope.ServiceProvider.GetServices<IEventHandler<TEvent>>();
        foreach (var handler in handlers) 
        {
            try
            {
                await handler.Handle(e);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"{handler} failed: {ex.Message}");
            }
        }
    }
}