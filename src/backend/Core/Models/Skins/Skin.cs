using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin(int setId, FigureType figure, SkinRarity rarity)
{
    public int Id { get; }
    public int SkinSetId { get; } = setId;
    public FigureType Figure { get; } = figure;
    public SkinRarity Rarity { get; } = rarity;
}