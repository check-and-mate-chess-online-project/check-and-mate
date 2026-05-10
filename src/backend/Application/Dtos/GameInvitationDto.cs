using Core.Models.Requests;

namespace Application.Dtos;

public class GameInvitationDto
{
    public Guid Id { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid SenderId { get; set; }
    public bool TimeControlIsEnabled { get; set; }
    public int? InitialTimeSec { get; set; }
    public int? IncrementPerMoveSec { get; set; }
    public DateTime ExpiresAt { get; set; }
    public GameInvitationState State { get; set; }
}