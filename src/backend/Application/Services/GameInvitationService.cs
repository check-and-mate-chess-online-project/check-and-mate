using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.UnitOfWork;
using Application.Exceptions;
using Application.Dtos;
using Application.Events;
using Application.Mappers;
using Application.Abstractions.Events;
using Core.Repositories;
using Core.Models.Requests;
using Core.Models.Games;
using Core.Models.Interfaces;
using Core.Models.Users;

namespace Application.Services;

public class GameInvitationService(
    IEventDispatcher eventDispatcher,
    IGameSessionService sessionService, 
    IGameInvitationRepository invitationRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IGameInvitationService
{
    private readonly IEventDispatcher _eventDispatcher = eventDispatcher;
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IGameInvitationRepository _invitationRepos = invitationRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<List<GameInvitationDto>> GetPendingGameInvitationsAsync(Guid userId)
    {
        List<GameInvitation> invitations = await _invitationRepos.GetPendingByUserAsync(userId);
        List<GameInvitationDto> invitationDtos = [];
        foreach (var invitation in invitations)
        {
            GameInvitationDto invitationDto = await GameInvitationMapper.ToDto(invitation, _userRepos);
            invitationDtos.Add(invitationDto);
        }
        return invitationDtos;
    }

    public async Task<GameInvitationDto> SendGameInvitationAsync(
        Guid senderId,
        string receiverLogin,
        bool timeControlIsEnabled, 
        int initialTimeSec, 
        int incrementPerMoveSec)
    {
        User sender = await _userRepos.GetAsync(senderId) ?? throw new NotFoundException($"user {senderId} not found");
        if (sender.IsDeleted) throw new UserDeletedException($"user {senderId} is deleted");
        User receiver = await _userRepos.GetAsync(receiverLogin) ?? throw new NotFoundException($"user {receiverLogin} not found");
        if (receiver.IsDeleted) throw new UserDeletedException($"user {receiverLogin} is deleted");
        if (await _invitationRepos.GetPendingAsync(senderId, receiver.Id) != null) 
            throw new ConflictException($"game invitation from {senderId} to {receiver.Id} already exist");
        if (_sessionService.GetByUserId(senderId) != null) 
            throw new ConflictException($"user {senderId} already in game");
        ITimeControl timeControl = timeControlIsEnabled ? new TimeControl(initialTimeSec, incrementPerMoveSec) : new DisabledTimeControl();
        GameInvitation invitation = new(senderId, receiver.Id, timeControl, GameInvitationState.Pending);
        _invitationRepos.Add(invitation);
        await _uow.CommitChangesAsync();
        return await GameInvitationMapper.ToDto(invitation, _userRepos);
    }

    public async Task<GameInvitationDto> AcceptGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) 
            ?? throw new NotFoundException($"game invitation {invitationId} not found");
        if (invitation.State != GameInvitationState.Pending) 
            throw new ConflictException($"game invitation {invitationId} already resolved");
        invitation.ChangeState(GameInvitationState.Accepted);
        await _invitationRepos.Update(invitation);
        Game game = _sessionService.Create(invitation.SenderId, invitation.ReceiverId, invitation.TimeControl);
        await _eventDispatcher.PublishAsync(new GameStarted(await GameMapper.ToDto(game, _userRepos)));
        await _uow.CommitChangesAsync();
        return await GameInvitationMapper.ToDto(invitation, _userRepos);
    }

    public async Task<GameInvitationDto> RejectGameInvitationAsync(Guid invitationId)
    {
        GameInvitation invitation = await _invitationRepos.GetAsync(invitationId) 
            ?? throw new NotFoundException($"game invitation {invitationId} not found");
        if (invitation.State != GameInvitationState.Pending) 
            throw new ConflictException($"game invitation {invitationId} already resolved");
        invitation.ChangeState(GameInvitationState.Rejected);
        await _invitationRepos.Update(invitation);
        await _uow.CommitChangesAsync();
        return await GameInvitationMapper.ToDto(invitation, _userRepos);
    }
}