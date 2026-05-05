namespace Application.Abstractions.Events;

public interface IEventHandler<TEvent>
{
    Task Handle(TEvent e);
}