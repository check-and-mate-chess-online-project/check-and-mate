using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin(Guid setId, FigureType figure, SkinRarity rarity, byte[] image, bool isDefault = false)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid SetId { get; } = setId;
    public FigureType Figure { get; } = figure;
    public SkinRarity Rarity { get; } = rarity;
    public byte[] Image { get; } = image;
    public bool IsDefault { get; } = isDefault;
}