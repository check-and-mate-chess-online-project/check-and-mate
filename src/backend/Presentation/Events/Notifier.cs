using Microsoft.AspNetCore.SignalR;
using Presentation.Hubs;
using Application.Dtos;

namespace Presentation.Events;

public class Notifier(IHubContext<GameHub> context) : INotifier
{
    private readonly IHubContext<GameHub> _context = context;

    public async Task NotifyGameStartedAsync(GameDto game)
    {
        await _context.Clients.Users(game.WhitePlayer.Id.ToString(), game.BlackPlayer.Id.ToString()).SendAsync("gameStarted", game);
    }

    public async Task NotifyTimeExpiredAsync(GameDto game, Guid userId)
    {
        await _context.Clients.Users(game.WhitePlayer.Id.ToString(), game.BlackPlayer.Id.ToString())
            .SendAsync("timeExpired", new { Game = game, UserId = userId });
    }
}