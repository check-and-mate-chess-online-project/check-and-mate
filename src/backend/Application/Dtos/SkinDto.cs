using Core.Models.Chess;
using Core.Models.Skins;

namespace Application.Dtos;

public class SkinDto
{
    public Guid Id { get; set; }
    public Guid SetId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public FigureType Figure { get; set; }
    public SkinRarity Rarity { get; set; }
    public SkinAssets Assets { get; set; } = null!;
    public bool IsDefault { get; set; }
}