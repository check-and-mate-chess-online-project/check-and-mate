using Core.Models.Chess;
using Core.Models.Skins;

namespace Infrastructure.Assets.Loaders;

public interface IDefaultSkinAssetsLoader
{
    byte[] Load(FigureType figure, SkinImageType image);
}