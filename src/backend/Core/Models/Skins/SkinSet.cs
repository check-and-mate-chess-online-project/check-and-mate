namespace Core.Models.Skins;

public class SkinSet
{
    public Guid Id { get; }
    public string Name { get; } = null!;
    public string? Description { get; }

    public SkinSet(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
    }
}