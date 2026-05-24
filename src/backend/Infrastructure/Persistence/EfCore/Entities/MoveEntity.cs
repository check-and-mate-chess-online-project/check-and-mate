namespace Infrastructure.Persistence.EfCore.Entities;

public class MoveEntity
{
    public int A { get; set; }
    public int B { get; set; }
    public int X { get; set; }
    public int Y { get; set; }
    public MoveOptionsEntity? O { get; set; }
}