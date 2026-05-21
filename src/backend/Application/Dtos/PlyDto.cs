using Core.Models.Chess;

namespace Application.Dtos;

public class PlyDto
{
    public int MoveNumber { get; set; }
    public PlayerColor Color { get; set; }
    public MoveDto Move { get; set; } = null!;
}