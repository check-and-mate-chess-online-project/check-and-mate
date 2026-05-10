using Core.Models.Requests;

namespace Application.Dtos;

public class FriendRequestDto
{
    public Guid Id { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid SenderId { get; set; }
    public FriendRequestState State { get; set; } 
}