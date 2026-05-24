using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Interfaces;
using Core.Models.Games;
using Core.Models.Requests;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class GameInvitationMapper
{
    public static GameInvitation ToDomain(GameInvitationEntity invitation)
    {
        ITimeControl timeControl = invitation.InitialTimeSec != null && invitation.IncrementPerMoveSec != null
            ? new TimeControl((int)invitation.InitialTimeSec, (int)invitation.IncrementPerMoveSec)
            : new DisabledTimeControl();
        return GameInvitation.Restore
        (
            invitation.Id,
            invitation.SenderId,
            invitation.ReceiverId,
            timeControl,
            invitation.ExpiresAt,
            (GameInvitationState)invitation.State
        );
    }

    public static GameInvitationEntity ToDb(GameInvitation invitation)
    {
        return GameInvitationEntity.Create
        (
            invitation.Id,
            invitation.SenderId,
            invitation.ReceiverId,
            invitation.TimeControl.InitialTimeSec,
            invitation.TimeControl.IncrementPerMoveSec,
            invitation.ExpiresAt,
            (int)invitation.State
        );
    }
}