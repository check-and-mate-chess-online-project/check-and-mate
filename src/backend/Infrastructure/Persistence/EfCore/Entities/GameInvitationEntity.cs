namespace Infrastructure.Persistence.EfCore.Entities;

public class GameInvitationEntity
{
    public Guid Id { get; private set; }
    public Guid SenderId { get; private set; }
    public Guid ReceiverId { get; private set; }
    public int? InitialTimeSec { get; private set; }
    public int? IncrementPerMoveSec { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public int State { get; private set; }

    public UserEntity Sender { get; private set; } = null!;
    public UserEntity Receiver { get; private set; } = null!;

    private GameInvitationEntity() {}

    public static GameInvitationEntity Create(
        Guid id,
        Guid senderId,
        Guid receiverId,
        int? initialTimeSec,
        int? incrementPerMoveSec,
        DateTime expiresAt,
        int state) => new()
        {
            Id = id,
            SenderId = senderId,
            ReceiverId = receiverId,
            InitialTimeSec = initialTimeSec,
            IncrementPerMoveSec = incrementPerMoveSec,
            ExpiresAt = expiresAt,
            State = state
        };
}