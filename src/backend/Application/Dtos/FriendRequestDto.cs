using Core.Models.Requests;

namespace Application.Dtos;

public class FriendRequestDto
{
    public Guid Id { get; init; }
    public Guid ReceiverId { get; init; }
    public Guid SenderId { get; init; }
    public FriendRequestState State { get; init; } 
}