using Core.Models.Chess;

namespace Core.Models.Skins;

public class Skin(
    Guid setId, 
    string name,
    string? description,
    FigureType figure, 
    SkinRarity rarity, 
    byte[] whiteBoardImage, 
    byte[] blackBoardImage, 
    byte[] idleImage, 
    byte[] startFightWinImage,
    byte[] startFightLoseImage,
    byte[] endFightWinImage,
    byte[] endFightLoseImage,
    bool isDefault = false)
{
    public Guid Id { get; } = Guid.NewGuid();
    public Guid SetId { get; } = setId;
    public string Name { get; } = name;
    public string? Description { get; } = description;
    public FigureType Figure { get; } = figure;
    public SkinRarity Rarity { get; } = rarity;
    public byte[] WhiteBoardImage { get; } = whiteBoardImage;
    public byte[] BlackBoardImage { get; } = blackBoardImage;
    public byte[] IdleImage { get; } = idleImage;
    public byte[] StartFightWinImage { get; } = startFightWinImage;
    public byte[] StartFightLoseImage { get; } = startFightLoseImage;
    public byte[] EndFightWinImage { get; } = endFightWinImage;
    public byte[] EndFightLoseImage { get; } = endFightLoseImage;
    public bool IsDefault { get; } = isDefault;
}