using Core.Models.Interfaces;
using Core.Models.Chess;
using Core.Exceptions;

namespace Core.Models.Games;

public class Game
{
    public Guid Id { get; }
    public Guid WhitePlayerId { get; }
    public Guid BlackPlayerId { get; }
    public IGameState State { get; private set; }
    public GameResult? Result { get; private set; }
    public GameTerminationReason? TerminationReason { get; private set; }
    public DateTime? StartTimeUtc { get; private set; }
    public DateTime? EndTimeUtc { get; private set; }
    public ITimeControl TimeControl { get; }
    private readonly IChessEngine _engine;

    public Game(Guid whitePlayerId, Guid blackPlayerId, IChessEngine engine, ITimeControl timeControl)
    {
        if (whitePlayerId == blackPlayerId) throw new CoreLogicException("players must be different");
        Id = Guid.NewGuid();
        WhitePlayerId = whitePlayerId;
        BlackPlayerId = blackPlayerId;
        State = new PendingGameState();
        TimeControl = timeControl;
        _engine = engine;
    }

    public MoveResult MakeMove(Move move, Guid playerId) => State.MakeMove(this, move, playerId);
    
    public void EndByTimeout(Guid playerId) => State.HandleTimeout(this, playerId);

    public void EndByResignation(Guid playerId) => State.HandleResign(this, playerId);

    public void EndByDisconnect(Guid playerId) => State.HandleDisconnect(this, playerId);

    public int GetMoveCount() => _engine.MoveCount;

    public bool IsValidMove(Move move, PlayerColor color) => _engine.IsValidMove(move, color);

    public List<(int A, int B, FigureType Figure, PlayerColor Color)> GetFigures() => _engine.GetFigures();

    public Guid GetCurrentPlayerId() => _engine.GetCurrentPlayer() == PlayerColor.White ? WhitePlayerId : BlackPlayerId;

    public Guid GetDefendingPlayerId() => _engine.GetDefendingPlayer() == PlayerColor.White ? WhitePlayerId : BlackPlayerId;

    public bool IsTimeExpired(out Guid userId)
    {
        PlayerColor color;
        if (_engine.GetCurrentPlayer() == PlayerColor.White)
        {
            color = PlayerColor.White;
            userId = WhitePlayerId;
        }
        else
        {
            color = PlayerColor.Black;
            userId = BlackPlayerId;
        }
        return !TimeControl.CheckLeftTime(color, DateTime.UtcNow);
    }

    public GameResult GetGameResultByTerminationReason(GameTerminationReason terminationReason, Guid? playerId = null)
    {
        return terminationReason switch
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

    internal void SetState(IGameState state) => State = state;

    internal void SetGameStartTime(DateTime currentTime) => StartTimeUtc = currentTime;

    internal ChessMoveResult ApplyMove(Move move) => _engine.MakeMove(move);

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
        Result = GetGameResultByTerminationReason(terminationReason, playerId);
    }
}