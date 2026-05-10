using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin(Guid setId, FigureType figure, SkinRarity rarity, byte[] whiteImage, byte[] blackImage, bool isDefault = false)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid SetId { get; } = setId;
    public FigureType Figure { get; } = figure;
    public SkinRarity Rarity { get; } = rarity;
    public byte[] WhiteImage { get; } = whiteImage;
    public byte[] BlackImage { get; } = blackImage;
    public bool IsDefault { get; } = isDefault;
}