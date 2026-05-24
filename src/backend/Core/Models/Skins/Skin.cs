using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin
{
    public Guid Id { get; }
    public Guid SetId { get; }
    public string Name { get; }
    public string? Description { get; }
    public FigureType Figure { get; }
    public SkinRarity Rarity { get; }
    public SkinAssets Assets { get; }
    public bool IsDefault { get; }

    public Skin(Guid setId, string name, string? description, FigureType figure, SkinRarity rarity, SkinAssets assets, bool isDefault = false) 
        : this(Guid.NewGuid(), setId, name, description, figure, rarity, assets, isDefault) {}

    private Skin(
        Guid id,
        Guid setId, 
        string name,
        string? description,
        FigureType figure, 
        SkinRarity rarity, 
        SkinAssets assets,
        bool isDefault = false)
    {
        Id = id;
        SetId = setId;
        Name = name;
        Description = description;
        Figure = figure;
        Rarity = rarity;
        Assets = assets;
        IsDefault = isDefault;
    }

    public static Skin Restore(
        Guid id,
        Guid setId, 
        string name,
        string? description,
        FigureType figure, 
        SkinRarity rarity, 
        SkinAssets assets,
        bool isDefault) 
        => new(id, setId, name, description, figure, rarity, assets, isDefault);
}