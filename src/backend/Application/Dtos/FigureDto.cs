using Core.Models.Chess;

namespace Application.Dtos;

public class FigureDto
{
    public int A { get; init; }
    public int B { get; init; }
    public FigureType Type { get; init; }
    public PlayerColor Color { get; init; }
}