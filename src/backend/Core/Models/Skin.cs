using Chess.Core;

namespace Core.Models;

public class Skin
{
    public int Id { get; private set; }
    public int SkinSetId { get; private set; }
    public SkinSet Set { get; private set; } = null!;
    public FigureType Figure { get; private set; }
    public SkinRarity Rarity { get; private set; }

    public Skin(SkinSet set, FigureType figure, SkinRarity rarity)
    {
        Set = set ?? throw new ArgumentNullException(nameof(set));
        SkinSetId = set.Id;
        Figure = figure;
        Rarity = rarity;
    }

    private Skin() {}
}