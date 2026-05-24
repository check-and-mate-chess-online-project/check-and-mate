namespace Core.Models.Skins;

public record SkinAssets(
    byte[] WhiteBoardImage, 
    byte[] BlackBoardImage, 
    byte[] IdleImage, 
    byte[] StartFightWinImage,
    byte[] StartFightLoseImage,
    byte[] EndFightWinImage,
    byte[] EndFightLoseImage);