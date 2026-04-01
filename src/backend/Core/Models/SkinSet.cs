namespace Core.Models;

public class SkinSet
{
    public int Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    public SkinSet(string name, string? description)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name cannot be empty");

        Name = name;
        Description = !string.IsNullOrWhiteSpace(description) ? description : null;
    }

    private SkinSet() {}
}