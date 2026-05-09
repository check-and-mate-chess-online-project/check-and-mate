using Microsoft.AspNetCore.SignalR;
using Presentation.Hubs;
using Application.Dtos;

namespace Presentation.Events;

public class Notifier(IHubContext<GameHub> context) : INotifier
{
    private readonly IHubContext<GameHub> _context = context;

    public async Task NotifyGameStartedAsync(GameDto game)
    {
        string? whitePlayerConnection = game.WhitePlayerId.ToString();
        string? blackPlayerConnection = game.BlackPlayerId.ToString();
        if (!string.IsNullOrEmpty(whitePlayerConnection) && !string.IsNullOrEmpty(blackPlayerConnection))
        {
            string groupId = game.Id.ToString();
            await _context.Groups.AddToGroupAsync(whitePlayerConnection, groupId);
            await _context.Groups.AddToGroupAsync(blackPlayerConnection, groupId);
            await _context.Clients.Group(groupId).SendAsync("gameStarted", game);
        }
    }

    public async Task NotifyTimeExpiredAsync(GameDto game, Guid userId)
    {
        await _context.Clients.Group(game.Id.ToString()).SendAsync("timeExpired", new { Game = game, UserId = userId });
    }
}