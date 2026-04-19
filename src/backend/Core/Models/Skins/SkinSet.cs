using Core.Models.Chess;

namespace Core.Models.Skins;

public class SkinSet
{
    public Guid Id { get; }
    public string Name { get; }
    public string? Description { get; }
    public IReadOnlyCollection<Guid> SkinIds => _skinIds.Values;
    private readonly Dictionary<FigureType, Guid> _skinIds = [];

    public SkinSet(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
    }

    public void AddSkin(FigureType figure, Guid skinId)
    {
        if (_skinIds.ContainsKey(figure)) throw new InvalidOperationException("skin for this figure already exists");
        _skinIds.Add(figure, skinId);
    }
}