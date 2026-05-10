using Application.Dtos;
using Core.Models.Requests;

namespace Application.Mappers;

public static class FriendRequestMapper
{
    public static FriendRequestDto ToDto(FriendRequest friendRequest) => new()
    {
        Id = friendRequest.Id,
        ReceiverId = friendRequest.ReceiverId,
        SenderId = friendRequest.SenderId,
        State = friendRequest.State
    };
}