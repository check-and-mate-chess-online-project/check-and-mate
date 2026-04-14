using Core.Models.Chess;

namespace Core.Models.Skins;

public class SkinSet
{
    public Guid Id { get; }
    public string Name { get; } = null!;
    public string? Description { get; }
    public IReadOnlyCollection<Guid> Skins => _skins.Values;
    private readonly Dictionary<FigureType, Guid> _skins = [];

    public SkinSet(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
    }

    public void AddSkin(FigureType figure, Guid skinId)
    {
        if (_skins.ContainsKey(figure)) throw new InvalidOperationException("skin for this figure already exists");
        _skins.Add(figure, skinId);
    }
}