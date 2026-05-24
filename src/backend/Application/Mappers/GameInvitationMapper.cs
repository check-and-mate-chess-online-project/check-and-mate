using Application.Dtos;
using Core.Models.Requests;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Mappers;

public static class GameInvitationMapper
{
    public static async Task<GameInvitationDto> ToDto(GameInvitation gameInvitation, IUserRepository userRepos)
    {
        User receiver = await userRepos.GetAsync(gameInvitation.ReceiverId)
            ?? throw new InvalidOperationException($"user {gameInvitation.ReceiverId} not exist");
        User sender = await userRepos.GetAsync(gameInvitation.SenderId)
            ?? throw new InvalidOperationException($"user {gameInvitation.SenderId} not exist");
        GameInvitationDto invitation = new()
        {
            Id = gameInvitation.Id,
            Sender = UserPublicMapper.ToDto(sender),
            Receiver = UserPublicMapper.ToDto(receiver),
            TimeControlIsEnabled = gameInvitation.TimeControl.IsEnabled,
            InitialTimeSec = gameInvitation.TimeControl.InitialTimeSec,
            IncrementPerMoveSec = gameInvitation.TimeControl.IncrementPerMoveSec,
            ExpiresAt = gameInvitation.ExpiresAt,
            State = gameInvitation.State
        };
        return invitation;
    }
}