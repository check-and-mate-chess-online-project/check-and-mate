using Core.Models.Interfaces;

namespace Core.Models.Chess;

public class Move(int a, int b, int x, int y, IEnumerable<IMoveOption> options)
{
    public int A { get; } = a;
    public int B { get; } = b;
    public int X { get; } = x;
    public int Y { get; } = y;
    public IReadOnlyList<IMoveOption> Options { get; } = (IReadOnlyList<IMoveOption>)options;
}