using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin
{
    public Guid Id { get; }
    public Guid SetId { get; }
    public FigureType Figure { get; }
    public SkinRarity Rarity { get; }

    public Skin(Guid setId, FigureType figure, SkinRarity rarity)
    {
        Id = Guid.NewGuid();
        SetId = setId;
        Figure = figure;
        Rarity = rarity;
    }
}