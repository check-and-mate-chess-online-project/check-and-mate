using Application.Services.Interfaces;
using Application.Orchestration.Games;
using Application.Abstractions.UnitOfWork;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Games;
using Core.Models.Interfaces;

namespace Application.Services;

public class GameInvitationService(GameSessionService sessionService, IGameInvitationRepository invitationRepos, IUnitOfWork uow) : IGameInvitationService
{
    private readonly GameSessionService _sessionService = sessionService;
    private readonly IGameInvitationRepository _invitationRepos = invitationRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task SendGameInvitationAsync(Guid senderId, Guid userId, int initialTimeSec, int incrementPerMoveSec)
    {
        if (await _invitationRepos.GetPendingAsync(senderId, userId) != null) throw new InvalidOperationException($"game invitation from {senderId} to {userId} already exist");
        if (_sessionService.GetByPlayers(senderId, userId) != null) throw new InvalidOperationException($"game session beetwen {senderId} and {userId} already exist");
        ITimeControl timeControl = initialTimeSec != 0 ? new TimeControl(initialTimeSec, incrementPerMoveSec) : new DisabledTimeControl();
        GameInvitation invitation = new(senderId, userId, timeControl, GameInvitationState.Pending);
        _invitationRepos.Add(invitation);
        await _uow.CommitChangesAsync();
    }

    public async Task AcceptGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) ?? throw new ArgumentException($"game invitation {invitationId} not exist");
        _sessionService.Create(invitation.SenderId, invitation.UserId, invitation.TimeControl);
        invitation.ChangeState(GameInvitationState.Accepted);
        _invitationRepos.Update(invitation);
        await _uow.CommitChangesAsync();
    }

    public async Task RejectGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) ?? throw new ArgumentException($"game invitation {invitationId} not exist");
        invitation.ChangeState(GameInvitationState.Rejected);
        _invitationRepos.Update(invitation);
        await _uow.CommitChangesAsync();
    }
}