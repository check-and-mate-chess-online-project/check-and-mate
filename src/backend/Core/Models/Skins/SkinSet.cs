namespace Core.Models.Skins;

public class SkinSet
{
    public int Id { get; }
    public string Name { get; } = null!;
    public string? Description { get; }

    public SkinSet(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");

        Name = name;
        Description = !string.IsNullOrWhiteSpace(description) ? description : null;
    }
}