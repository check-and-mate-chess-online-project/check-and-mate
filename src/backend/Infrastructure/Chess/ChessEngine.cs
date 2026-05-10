using ChessLib.GameLogic;
using Core.Models.Interfaces;
using Core.Models.Chess;
using ChessLib.Entities;
using ChessLib.MoveOptions;

namespace Infrastructure.Chess;

public class ChessEngine : IChessEngine
{
    public int MoveCount => _gameHandler.Field.AmountMovesOnField;
    private readonly GameHandler _gameHandler = new();

    public ChessMoveResult MakeMove(Move move)
    {
        IReadOnlyList<IMoveOption> options = move.Options;
        MoveOption[] moveOptions = new MoveOption[options.Count];
        for (int i = 0; i < options.Count; i++) moveOptions[i] = ChessMapper.ToEngine(options[i]);
        MoveResult moveResult = _gameHandler.MakeMove(move.A, move.B, move.X, move.Y, moveOptions);
        ChessGameTerminationReason? terminationReason = moveResult.TerminalType != null 
            ? ChessMapper.ToDomain((TerminalPositionType)moveResult.TerminalType) 
            : null;
        ChessMoveResult result = new(moveResult.IsValid, terminationReason);
        return result;
    }

    public bool IsValidMove(Move move, PlayerColor playerColor)
    {
        Color color = ChessMapper.ToEngine(playerColor);
        return ChessLib.Validation.MoveValidator.IsValidMove(move.A, move.B, move.X, move.Y, color, _gameHandler.Field);
    }

    public List<Figure> GetFigures()
    {
        List<Figure> figures = [];
        foreach (var figure in _gameHandler.Field.GetCopyOfField())
        {
            if (figure == null) continue;
            figures.Add(ChessMapper.ToDomain(figure));
        }
        return figures;
    }

    public List<Ply> GetMoves() => ChessMapper.ToDomain(_gameHandler.Field.GetMoves());

    public PlayerColor GetCurrentPlayer() => ChessMapper.ToDomain(_gameHandler.GetMovingPlayer().Color);

    public PlayerColor GetDefendingPlayer() => ChessMapper.ToDomain(_gameHandler.GetDefendingPlayer().Color);
}