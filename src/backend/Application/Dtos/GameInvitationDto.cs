using Core.Models.Requests;

namespace Application.Dtos;

public class GameInvitationDto
{
    public Guid Id { get; init; }
    public Guid ReceiverId { get; init; }
    public Guid SenderId { get; init; }
    public bool TimeControlIsEnabled { get; init; }
    public int? InitialTimeSec { get; init; }
    public int? IncrementPerMoveSec { get; init; }
    public DateTime ExpiresAt { get; init; }
    public GameInvitationState State { get; init; }
}