using Microsoft.AspNetCore.SignalR;
using Presentation.Hubs;
using Application.Dtos;
using Infrastructure.Connections;

namespace Presentation.Events;

public class Notifier(IHubContext<GameHub> context, ConnectionManager connections) : INotifier
{
    private readonly IHubContext<GameHub> _context = context;
    private readonly ConnectionManager _connections = connections;

    public async Task NotifyGameStartedAsync(GameDto game)
    {
        string? whitePlayerConnection = _connections.Get(game.WhitePlayerId);
        string? blackPlayerConnection = _connections.Get(game.BlackPlayerId);
        if (!string.IsNullOrEmpty(whitePlayerConnection) && !string.IsNullOrEmpty(blackPlayerConnection))
        {
            string groupId = game.Id.ToString();
            await _context.Groups.AddToGroupAsync(game.WhitePlayerId.ToString(), groupId);
            await _context.Groups.AddToGroupAsync(game.BlackPlayerId.ToString(), groupId);
            await _context.Clients.Groups(groupId).SendAsync("GameStarted", game);
        }
    }

    public async Task NotifyTimeExpiredAsync(Guid gameId, Guid userId)
    {
        await _context.Clients.Groups(gameId.ToString()).SendAsync("TimeExpired", gameId, userId);
    }
}