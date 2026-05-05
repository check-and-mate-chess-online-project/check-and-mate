using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.UnitOfWork;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Games;
using Core.Models.Interfaces;
using Core.Models.Users;

namespace Application.Services;

public class GameInvitationService(
    IGameSessionService sessionService, 
    IGameInvitationRepository invitationRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IGameInvitationService
{
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IGameInvitationRepository _invitationRepos = invitationRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task SendGameInvitationAsync(Guid senderId, Guid receiverId, int initialTimeSec, int incrementPerMoveSec)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new NotFoundException($"user {senderId} not found");
        if (sender.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        User user = await _userRepos.GetAsync(receiverId) ?? throw new NotFoundException($"user {senderId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        if (await _invitationRepos.GetPendingAsync(senderId, receiverId) != null) 
            throw new ConflictException($"game invitation from {senderId} to {receiverId} already exist");
        if (_sessionService.GetByPlayers(senderId, receiverId) != null) 
            throw new ConflictException($"game session beetwen {senderId} and {receiverId} already exist");
        ITimeControl timeControl = initialTimeSec != 0 ? new TimeControl(initialTimeSec, incrementPerMoveSec) : new DisabledTimeControl();
        GameInvitation invitation = new(senderId, receiverId, timeControl, GameInvitationState.Pending);
        _invitationRepos.Add(invitation);
        await _uow.CommitChangesAsync();
    }

    public async Task AcceptGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) 
            ?? throw new NotFoundException($"game invitation {invitationId} not found");
        _sessionService.Create(invitation.SenderId, invitation.ReceiverId, invitation.TimeControl);
        invitation.ChangeState(GameInvitationState.Accepted);
        _invitationRepos.Update(invitation);
        await _uow.CommitChangesAsync();
    }

    public async Task RejectGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) 
            ?? throw new NotFoundException($"game invitation {invitationId} not found");
        invitation.ChangeState(GameInvitationState.Rejected);
        _invitationRepos.Update(invitation);
        await _uow.CommitChangesAsync();
    }
}