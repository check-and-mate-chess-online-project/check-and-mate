using Microsoft.Extensions.Hosting;
using Application.Abstractions.GameSessions;
using Application.Abstractions.Events;
using Application.Events;

namespace Infrastructure.Background;

public class TimeService(IGameSessionStore games, IEventDispatcher eventDispatcher) : BackgroundService
{
    private readonly IGameSessionStore _games = games;
    private readonly IEventDispatcher _eventDispatcher = eventDispatcher;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            foreach (var game in _games.GetAll())
            {
                if (game.IsTimeExpired(out Guid userId)) 
                    await _eventDispatcher.PublishAsync(new TimeExpired(game.Id, userId));
            }
            await Task.Delay(1000, stoppingToken);
        }
    }
}