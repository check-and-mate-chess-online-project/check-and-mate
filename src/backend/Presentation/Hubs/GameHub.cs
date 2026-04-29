using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using Presentation.Requests;
using Application.Services.Interfaces;
using Application.Dtos;
using Infrastructure.Connections;
using Core.Models.Chess;

namespace Presentation.Hubs;

[Authorize]
public class GameHub(ConnectionManager connections, IMatchmakingService matchmaking, IGameplayService gameplay) : Hub
{
    private readonly ConnectionManager _connections = connections;
    private readonly IMatchmakingService _matchmaking = matchmaking;
    private readonly IGameplayService _gameplay = gameplay;

    public override Task OnConnectedAsync()
    {
        Guid userId = GetUserId();
        _connections.Add(userId, Context.ConnectionId);
        return base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Guid userId = GetUserId();
        await _matchmaking.StopOpponentSearchAsync(userId);
        GameDto? game = _gameplay.GetActiveGameByUser(userId);
        if (game != null)
        {
            await _gameplay.HandleDisconnectAsync(userId);
            await Clients.Group(game.Id.ToString()).SendAsync("UserDisconnected", userId);
        }
        _connections.Remove(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task FindGame(SearchOpponentRequest request)
    {
        Guid userId = GetUserId();
        await _matchmaking.StartOpponentSearchAsync(userId, request.IsEnabled, request.InitialTimeSec, request.IncrementPerMoveSec);
        await Clients.Caller.SendAsync("StartOpponentSearch");
    }

    public async Task<MoveResultDto> MakeMove(Move move)
    {
        Guid userId = GetUserId();
        GameDto game = _gameplay.GetActiveGameByUser(userId) ?? throw new HubException($"user {userId} not in game");
        MoveResultDto result = await _gameplay.MakeMoveAsync(userId, move);
        await Clients.Group(game.Id.ToString()).SendAsync("MoveMade", move, result);
        return result;
    }

    public async Task Resign()
    {
        Guid userId = GetUserId();
        GameDto game = _gameplay.GetActiveGameByUser(userId) ?? throw new HubException($"user {userId} not in game");
        await _gameplay.HandleResignAsync(userId);
        await Clients.Group(game.Id.ToString()).SendAsync("GameEnded");
    }

    private Guid GetUserId() => Guid.TryParse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new HubException($"invalid user identity");
}