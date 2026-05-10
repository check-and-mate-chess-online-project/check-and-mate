using Core.Models.Chess;
using Core.Models.Skins;

namespace Application.Dtos;

public class SkinDto
{
    public Guid Id { get; set; }
    public Guid SetId { get; set; }
    public FigureType Figure { get; set; }
    public SkinRarity Rarity { get; set; }
    public byte[] WhiteImage { get; set; } = null!;
    public byte[] BlackImage { get; set; } = null!;
    public bool IsDefault { get; set; }
}