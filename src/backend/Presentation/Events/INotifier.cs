using Application.Dtos;

namespace Presentation.Events;

public interface INotifier
{
    Task NotifyGameStartedAsync(GameDto game);
    Task NotifyTimeExpiredAsync(GameDto game, Guid userId);
}