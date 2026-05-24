namespace Infrastructure.Persistence.EfCore.Entities;

public class GameEntity
{
    public Guid Id { get; private set; }
    public Guid WhitePlayerId { get; private set; }
    public Guid BlackPlayerId { get; private set; }
    public string? Moves { get; private set; }
    public int Result { get; private set; }
    public int TerminationReason { get; private set; }
    public int? InitialTimeSec { get; private set; }
    public int? IncrementPerMoveSec { get; private set; }
    public DateTime StartTimeUtc { get; private set; }
    public DateTime EndTimeUtc { get; private set; }

    public UserEntity WhitePlayer { get; private set; } = null!;
    public UserEntity BlackPlayer { get; private set; } = null!;

    private GameEntity() { }

    public static GameEntity Create(
        Guid id,
        Guid whitePlayerId,
        Guid blackPlayerId,
        string? moves,
        int result,
        int terminationReason,
        int? initialTimeSec,
        int? incrementPerMoveSec,
        DateTime startTimeUtc,
        DateTime endTimeUtc) => new()
    {
        Id = id,
        WhitePlayerId = whitePlayerId,
        BlackPlayerId = blackPlayerId,
        Moves = moves,
        Result = result,
        TerminationReason = terminationReason,
        InitialTimeSec = initialTimeSec,
        IncrementPerMoveSec = incrementPerMoveSec,
        StartTimeUtc = startTimeUtc,
        EndTimeUtc = endTimeUtc
    };
}