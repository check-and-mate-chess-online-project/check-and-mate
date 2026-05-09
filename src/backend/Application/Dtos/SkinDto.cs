using Core.Models.Chess;
using Core.Models.Skins;

namespace Application.Dtos;

public class SkinDto
{
    public Guid Id { get; init; }
    public Guid SetId { get; init; }
    public FigureType Figure { get; init; }
    public SkinRarity Rarity { get; init; }
    public byte[] WhiteImage { get; init; } = null!;
    public byte[] BlackImage { get; init; } = null!;
    public bool IsDefault { get; init; }
}