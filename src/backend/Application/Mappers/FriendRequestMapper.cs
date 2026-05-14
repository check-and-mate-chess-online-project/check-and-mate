using Application.Dtos;
using Core.Models.Requests;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Mappers;

public static class FriendRequestMapper
{
    public static async Task<FriendRequestDto> ToDto(FriendRequest friendRequest, IUserRepository userRepos)
    {
        User receiver = await userRepos.GetAsync(friendRequest.ReceiverId) 
            ?? throw new InvalidOperationException($"user {friendRequest.ReceiverId} not exist");
        User sender = await userRepos.GetAsync(friendRequest.SenderId) 
            ?? throw new InvalidOperationException($"user {friendRequest.SenderId} not exist");
        FriendRequestDto request = new()
        {
            Id = friendRequest.Id,
            Receiver = UserPublicMapper.ToDto(receiver),
            Sender = UserPublicMapper.ToDto(sender),
            State = friendRequest.State
        };
        return request;
    }
}