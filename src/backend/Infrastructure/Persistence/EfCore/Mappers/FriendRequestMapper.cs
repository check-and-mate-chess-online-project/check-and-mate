using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Requests;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class FriendRequestMapper
{
    public static FriendRequest ToDomain(FriendRequestEntity request)
    {
        return FriendRequest.Restore
        (
            request.Id,
            request.SenderId,
            request.ReceiverId,
            (FriendRequestState)request.State
        );
    }

    public static FriendRequestEntity ToDb(FriendRequest request) => FriendRequestEntity.Create
    (
        request.Id,
        request.SenderId,
        request.ReceiverId,
        (int)request.State
    );
}