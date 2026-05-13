using Core.Models.Chess;
using Core.Models.Skins;

namespace Application.Dtos;

public class SkinDto
{
    public Guid Id { get; set; }
    public Guid SetId { get; set; }
    public FigureType Figure { get; set; }
    public SkinRarity Rarity { get; set; }
    public byte[] WhiteBoardImage { get; set; } = null!;
    public byte[] BlackBoardImage { get; set; } = null!;
    public byte[] IdleImage { get; set; } = null!;
    public byte[] StartFightWinImage { get; set; } = null!;
    public byte[] StartFightLoseImage { get; set; } = null!;
    public byte[] EndFightWinImage { get; set; } = null!;
    public byte[] EndFightLoseImage { get; set; } = null!;
    public bool IsDefault { get; set; }
}