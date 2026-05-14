using System.Reflection;
using Core.Models.Chess;
using Core.Models.Skins;

namespace Infrastructure.Assets.Loaders;

public class DefaultSkinAssetsLoader : IDefaultSkinAssetsLoader
{
    private readonly Assembly _assembly = typeof(DefaultSkinAssetsLoader).Assembly;
    private readonly string _basePath = "Infrastructure.Assets.DefaultSkins";
    private readonly string _format = "png";

    public byte[] Load(FigureType figure, SkinImageType image)
    {
        string resourceName = $"{_basePath}.{figure}.{image}.{_format}";
        using Stream stream = _assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException($"embedded resource '{resourceName}' not found.");
        using MemoryStream ms = new();
        stream.CopyTo(ms);
        return ms.ToArray();
    }
}