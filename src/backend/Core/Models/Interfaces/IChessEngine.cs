using Core.Models.Chess;

namespace Core.Models.Interfaces;

public interface IChessEngine
{
    int MoveCount { get; }
    ChessMoveResult MakeMove(Move move);
    bool IsValidMove(Move move, PlayerColor playerColor);
    List<(int A, int B, FigureType Figure, PlayerColor Color)> GetFigures();
    PlayerColor GetCurrentPlayer();
    PlayerColor GetDefendingPlayer();
}