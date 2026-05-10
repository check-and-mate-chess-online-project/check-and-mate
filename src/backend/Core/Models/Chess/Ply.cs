namespace Core.Models.Chess;

public class Ply(int moveNumber, PlayerColor color, List<Move> coordinates)
{
    public int MoveNumber { get; } = moveNumber;
    public PlayerColor Color { get; } = color;
    public List<Move> Coordinates { get; } = coordinates;
}