using Application.Dtos;
using Core.Models.Requests;

namespace Application.Mappers;

public static class GameInvitationMapper
{
    public static GameInvitationDto ToDto(GameInvitation invitation) => new()
    {
        Id = invitation.Id,
        ReceiverId = invitation.ReceiverId,
        SenderId = invitation.SenderId,
        TimeControlIsEnabled = invitation.TimeControl.IsEnabled,
        InitialTimeSec = invitation.TimeControl.InitialTimeSec,
        IncrementPerMoveSec = invitation.TimeControl.IncrementPerMoveSec,
        ExpiresAt = invitation.ExpiresAt,
        State = invitation.State
    };
}