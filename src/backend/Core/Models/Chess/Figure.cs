namespace Core.Models.Chess;

public class Figure(int a, int b, FigureType type, PlayerColor color)
{
    public int A { get; set; } = a;
    public int B { get; set; } = b;
    public FigureType Type { get; set; } = type;
    public PlayerColor Color { get; set; } = color;
}