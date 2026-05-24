namespace Core.Models.Chess;

public class Ply(int moveNumber, PlayerColor color, Move move)
{
    public int MoveNumber { get; } = moveNumber;
    public PlayerColor Color { get; } = color;
    public Move Move { get; } = move;
}