using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Presentation.Requests;
using Application.Services.Interfaces;
using Application.Abstractions.Connections;
using Application.Dtos;
using Core.Models.Games;

namespace Presentation.Hubs;

[Authorize]
public class GameHub(
    IMatchmakingService matchmaking, 
    IGameplayService gameplay, 
    IGameInvitationService invitation,
    IConnectionGracePeriodTimer timer) : Hub
{
    private readonly IMatchmakingService _matchmaking = matchmaking;
    private readonly IGameplayService _gameplay = gameplay;
    private readonly IGameInvitationService _invitation = invitation;
    private readonly IConnectionGracePeriodTimer _timer = timer;

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Guid userId = GetUserId();
        await _matchmaking.StopOpponentSearchAsync(userId);
        _timer.StartGracePeriod(userId, Leave);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task<List<GameInvitationDto>> GetPendingInvitations()
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        return await _invitation.GetPendingGameInvitationsAsync(userId);
    }

    public async Task FindGame(SearchOpponentRequest request)
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        await _matchmaking.StartOpponentSearchAsync(userId, request.TimeControlIsEnabled, request.InitialTimeSec, request.IncrementPerMoveSec);
        await Clients.Caller.SendAsync("startOpponentSearch");
    }

    public async Task CancelSearch()
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        await _matchmaking.StopOpponentSearchAsync(userId);
        await Clients.Caller.SendAsync("stopOpponentSearch");
    }

    public async Task SendGameInvitation(SendGameInvitationRequest request)
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        GameInvitationDto invitation;
        if (request.ReceiverId != null)
        {
            invitation = await _invitation.SendGameInvitationAsync(
                userId, 
                request.ReceiverId.Value,
                request.TimeControlIsEnabled, 
                request.InitialTimeSec, 
                request.IncrementPerMoveSec);
        }
        else if (request.ReceiverLogin != null)
        {
            invitation = await _invitation.SendGameInvitationAsync(
                userId, 
                request.ReceiverLogin,
                request.TimeControlIsEnabled, 
                request.InitialTimeSec, 
                request.IncrementPerMoveSec);
        }
        else throw new HubException("id or login must be specified");
        await Clients.User(invitation.ReceiverId.ToString()).SendAsync("gameInvitationReceived", invitation);
        await Clients.Caller.SendAsync("gameInvitationSent", invitation);
    }

    public async Task AcceptGameInvitation(Guid invitationId)
    {
        _timer.CancelGracePeriod(GetUserId());
        GameInvitationDto invitation = await _invitation.AcceptGameInvitationAsync(invitationId);
        await Clients.Users(invitation.SenderId.ToString(), invitation.ReceiverId.ToString()).SendAsync("gameInvitationAccepted", invitation);
    }

    public async Task RejectGameInvitation(Guid invitationId)
    {
        _timer.CancelGracePeriod(GetUserId());
        GameInvitationDto invitation = await _invitation.RejectGameInvitationAsync(invitationId);
        await Clients.Users(invitation.SenderId.ToString(), invitation.ReceiverId.ToString()).SendAsync("gameInvitationRejected", invitation);
    }

    public async Task MakeMove(MakeMoveRequest request)
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        GameDto game = _gameplay.GetActiveGameByUser(userId) ?? throw new HubException($"user {userId} not in game");
        MoveResultDto result = await _gameplay.MakeMoveAsync(userId, request.A, request.B, request.X, request.Y, request.Options);
        switch (result.Status)
        {
            case MoveAttemptStatus.Success: 
                await Clients.Users(game.WhitePlayerId.ToString(), game.BlackPlayerId.ToString())
                    .SendAsync("moveMade", new { Request = request, Result = result });
                break;
            case MoveAttemptStatus.Timeout:
            case MoveAttemptStatus.Invalid:
                await Clients.Caller.SendAsync("moveRejected", new { Request = request, Result = result }); 
                break;
        }
    }

    public async Task Resign()
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        GameDto game = await _gameplay.HandleResignAsync(userId);
        await Clients.Users(game.WhitePlayerId.ToString(), game.BlackPlayerId.ToString())
            .SendAsync("playerResigned", new { Game = game, UserId = userId });
    }

    public async Task Leave()
    {
        Guid userId = GetUserId();
        _timer.CancelGracePeriod(userId);
        GameDto? game = await _gameplay.HandleDisconnectAsync(userId);
        if (game != null) await Clients.Users(game.WhitePlayerId.ToString(), game.BlackPlayerId.ToString())
            .SendAsync("playerLeft",  new { Game = game, UserId = userId });
    }

    private Guid GetUserId() => Guid.TryParse(Context.UserIdentifier, out Guid userId) 
        ? userId 
        : throw new HubException($"invalid user identity");
}