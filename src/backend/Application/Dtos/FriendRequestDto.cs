using Core.Models.Requests;

namespace Application.Dtos;

public class FriendRequestDto
{
    public Guid Id { get; set; }
    public UserPublicDto Sender { get; set; } = null!;
    public UserPublicDto Receiver { get; set; } = null!;
    public FriendRequestState State { get; set; } 
}