namespace Application.Abstractions.Events;

public interface IEventDispatcher
{
    Task PublishAsync<TEvent>(TEvent eventData);
    void Subscribe<TEvent>(Func<TEvent, Task> handler);
}