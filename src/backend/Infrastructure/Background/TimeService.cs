using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Application.Abstractions.GameSessions;
using Application.Abstractions.Events;
using Application.Events;
using Application.Mappers;
using Core.Repositories;
using Infrastructure.Persistence.EfCore.Repositories;

namespace Infrastructure.Background;

public class TimeService(IGameSessionStore games, IServiceScopeFactory scopeFactory, IEventDispatcher eventDispatcher) : BackgroundService
{
    private readonly IGameSessionStore _games = games;
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;
    private readonly IEventDispatcher _eventDispatcher = eventDispatcher;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using IServiceScope scope = _scopeFactory.CreateScope();
            IUserRepository userRepos = scope.ServiceProvider.GetRequiredService<IUserRepository>();
            foreach (var game in _games.GetAll())
            {
                if (game.IsTimeExpired(out Guid userId)) 
                    await _eventDispatcher.PublishAsync(new TimeExpired(await GameMapper.ToDto(game, userRepos), userId));
            }
            await Task.Delay(1000, stoppingToken);
        }
    }
}