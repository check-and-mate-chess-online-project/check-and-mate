using System.Reflection;
using Core.Models.Chess;
using Core.Models.Skins;

namespace Infrastructure.Assets.Loaders;

public class DefaultSkinAssetsLoader : IDefaultSkinAssetsLoader
{
    private readonly Assembly _assembly = typeof(DefaultSkinAssetsLoader).Assembly;
    private readonly string _basePath = "Infrastructure.Assets.DefaultSkins";
    private readonly string[] SupportedFormats = ["webp", "svg"];

    public byte[] Load(FigureType figure, SkinImageType image)
    {
        foreach (var format in SupportedFormats)
        {
            byte[]? data = TryLoadResource(figure, image, format);
            if (data != null) return data;
        }
        throw new InvalidOperationException("unsupported format");
    }

    private byte[]? TryLoadResource(FigureType figure, SkinImageType image, string format)
    {
        string resourceName = $"{_basePath}.{figure}.{image}.{format}";
        using Stream? stream = _assembly.GetManifestResourceStream(resourceName);
        if (stream == null) return null;
        using MemoryStream ms = new();
        stream.CopyTo(ms);
        return ms.ToArray();
    }
}