using Core.Models.Requests;

namespace Application.Dtos;

public class GameInvitationDto
{
    public Guid Id { get; set; }
    public UserPublicDto Sender { get; set; } = null!;
    public UserPublicDto Receiver { get; set; } = null!;
    public bool TimeControlIsEnabled { get; set; }
    public int? InitialTimeSec { get; set; }
    public int? IncrementPerMoveSec { get; set; }
    public DateTime ExpiresAt { get; set; }
    public GameInvitationState State { get; set; }
}