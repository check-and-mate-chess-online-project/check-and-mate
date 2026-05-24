namespace Infrastructure.Persistence.EfCore.Entities;

public class SkinSetEntity
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; }

    public ICollection<SkinEntity> Skins { get; private set; } = [];

    private SkinSetEntity() { }

    public static SkinSetEntity Create(Guid id, string name, string? description)
        => new() { Id = id, Name = name, Description = description };
}