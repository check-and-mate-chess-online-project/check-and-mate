namespace Core.Models.Skins;

public class SkinSet
{
    public Guid Id { get; }
    public string Name { get; }
    public string? Description { get; }

    public SkinSet(string name, string? description = null)
        : this(Guid.NewGuid(), name, description) {}

    private SkinSet(Guid id, string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");
        Id = id;
        Name = name;
        Description = description;
    }

    public static SkinSet Restore(Guid id, string name, string? description)
        => new(id, name, description);
}