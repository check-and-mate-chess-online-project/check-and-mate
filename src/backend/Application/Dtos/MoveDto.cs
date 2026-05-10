namespace Application.Dtos;

public class MoveDto
{
    public int A { get; set; }
    public int B { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public MoveOptionsDto Options { get; set; } = null!;
}