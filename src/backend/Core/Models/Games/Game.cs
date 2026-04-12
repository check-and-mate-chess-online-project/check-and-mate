using Core.Models.Interfaces;
using Core.Models.Chess;

namespace Core.Models.Games;

public class Game
{
    public Guid Id { get; private set; }
    public Guid WhitePlayerId { get; private set; }
    public Guid BlackPlayerId { get; private set; }
    public IGameState State { get; private set; } = null!;
    public GameResult? Result { get; private set; } = null;
    public GameTerminationReason? TerminationReason { get; private set; }
    public DateTime? StartTimeUtc { get; private set; }
    public DateTime? EndTimeUtc { get; private set; }
    public ITimeControl TimeControl { get; private set; } = null!;
    private readonly IChessEngine _engine = null!;

    public Game(Guid whitePlayerId, Guid blackPlayerId, IChessEngine engine, ITimeControl timeControl)
    {
        if (whitePlayerId == blackPlayerId) throw new ArgumentException("players must be different");
        Id = Guid.NewGuid();
        WhitePlayerId = whitePlayerId;
        BlackPlayerId = blackPlayerId;
        State = new PendingGameState();
        TimeControl = timeControl;
        _engine = engine;
    }

    internal MoveResult MakeMove(Move move, Guid playerId) => State.MakeMove(this, move, playerId);
    
    internal void EndByTimeout(Guid playerId) => State.HandleTimeout(this, playerId);

    internal void EndByResignation(Guid playerId) => State.HandleResign(this, playerId);

    internal void EndByDisconnect(Guid playerId) => State.HandleDisconnect(this, playerId);

    internal void SetState(IGameState state) => State = state;

    internal int GetMoveCount() => _engine.MoveCount;

    internal ChessMoveResult ApplyMove(Move move) => _engine.MakeMove(move);

    internal bool IsValidMove(Move move) => _engine.IsValidMove(move);

    internal Guid GetCurrentPlayerId() => _engine.GetCurrentPlayer() == PlayerColor.White ? WhitePlayerId : BlackPlayerId;

    internal Guid GetDefendingPlayerId() => _engine.GetDefendingPlayer() == PlayerColor.White ? WhitePlayerId : BlackPlayerId;

    internal void SetGameStartTime(DateTime currentTime) => StartTimeUtc = currentTime;

    internal void SetMoveStartTime(Guid playerId, DateTime currentTime)
    {
        if (playerId == WhitePlayerId) TimeControl.SetMoveStartTime(PlayerColor.White, currentTime);
        else TimeControl.SetMoveStartTime(PlayerColor.Black, currentTime);
    }

    internal void UpdatePlayerTime(Guid playerId, DateTime currentTime)
    {
        if (playerId == WhitePlayerId) TimeControl.UpdateTime(PlayerColor.White, currentTime);
        else TimeControl.UpdateTime(PlayerColor.Black, currentTime);
    }

    internal bool CheckPlayerLeftTime(Guid playerId, DateTime currentTime)
    {
        return playerId == WhitePlayerId
            ? TimeControl.CheckLeftTime(PlayerColor.White, currentTime)
            : TimeControl.CheckLeftTime(PlayerColor.Black, currentTime);
    }

    internal void FinishGame(GameTerminationReason terminationReason, Guid? playerId = null)
    {
        TerminationReason = terminationReason;
        EndTimeUtc = DateTime.UtcNow;
        Result = terminationReason switch
        {
            GameTerminationReason.CheckMate => playerId == WhitePlayerId ? GameResult.WhiteVictory : GameResult.BlackVictory,
            GameTerminationReason.StaleMate => GameResult.Draw,
            GameTerminationReason.Resignation => playerId == WhitePlayerId ? GameResult.BlackVictory : GameResult.WhiteVictory,
            GameTerminationReason.Timeout => playerId == WhitePlayerId ? GameResult.BlackVictory : GameResult.WhiteVictory,
            GameTerminationReason.DrawAgreement => GameResult.Draw,
            GameTerminationReason.Disconnect => playerId == WhitePlayerId ? GameResult.BlackVictory : GameResult.WhiteVictory,
            _ => throw new ArgumentException("invalid game termination reason")
        };
    }
}