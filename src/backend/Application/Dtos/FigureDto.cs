using Core.Models.Chess;

namespace Application.Dtos;

public class FigureDto
{
    public int A { get; set; }
    public int B { get; set; }
    public FigureType Type { get; set; }
    public PlayerColor Color { get; set; }
}