using ChessLib.GameLogic;
using Core.Models.Interfaces;
using Core.Models.Chess;
using ChessLib.Entities;

namespace Infrastructure.Chess;

public class ChessEngine : IChessEngine
{
    public int MoveCount => _gameHandler.Field.AmountMovesOnField;

    private readonly GameHandler _gameHandler = new();

    public ChessMoveResult MakeMove(Move move)
    {
        IReadOnlyList<IMoveOption> options = move.Options;
        ChessLib.MoveOptions.MoveOption[] moveOptions = [];
        for (int i = 0; i < options.Count; i++) moveOptions[i] = ChessMapper.ToEngine(options[i]);
        MoveResult moveResult = _gameHandler.MakeMove(move.A, move.B, move.X, move.Y, moveOptions);
        ChessGameTerminationReason? terminationReason = moveResult.TerminalType != null 
            ? ChessMapper.FromEngine((TerminalPositionType)moveResult.TerminalType) 
            : null;
        ChessMoveResult result = new(moveResult.IsValid, terminationReason);
        return result;
    }

    public bool IsValidMove(Move move, PlayerColor playerColor)
    {
        Color color = ChessMapper.ToEngine(playerColor);
        return ChessLib.Validation.MoveValidator.IsValidMove(move.A, move.B, move.X, move.Y, color, _gameHandler.Field);
    }

    public List<(int A, int B, Core.Models.Chess.FigureType Figure, PlayerColor Color)> GetFigures()
    {
        List<(int A, int B, Core.Models.Chess.FigureType Figure, PlayerColor Color)> figures = [];
        foreach (var cell in _gameHandler.Field.GetCopyOfField())
        {
            if (cell == null) continue;
            figures.Add((cell.A, cell.B, ChessMapper.FromEngine(cell.Title), ChessMapper.FromEngine(cell.Color)));
        }
        return figures;
    }

    public PlayerColor GetCurrentPlayer() => ChessMapper.FromEngine(_gameHandler.GetMovingPlayer().Color);

    public PlayerColor GetDefendingPlayer() => ChessMapper.FromEngine(_gameHandler.GetDefendingPlayer().Color);
}