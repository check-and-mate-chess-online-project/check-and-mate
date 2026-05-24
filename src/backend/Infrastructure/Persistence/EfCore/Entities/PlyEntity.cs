namespace Infrastructure.Persistence.EfCore.Entities;

public class PlyEntity
{
    public int N { get; set; }
    public int P { get; set; }
    public MoveEntity M { get; set; } = null!;
}