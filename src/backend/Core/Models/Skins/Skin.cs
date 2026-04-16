using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin
{
    public Guid Id { get; }
    public Guid SetId { get; }
    public FigureType Figure { get; }
    public SkinRarity Rarity { get; }
    public bool IsDefault { get; }

    internal Skin(Guid setId, FigureType figure, SkinRarity rarity, bool isDefault = false)
    {
        Id = Guid.NewGuid();
        SetId = setId;
        Figure = figure;
        Rarity = rarity;
        IsDefault = isDefault;
    }
}