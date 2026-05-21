namespace Infrastructure.Persistence.EfCore.Entities;

public class UserFigureSkinEntity
{
    public Guid UserId { get; private set; }
    public int Figure { get; private set; }
    public Guid SkinId { get; private set; }

    public UserEntity User { get; private set; } = null!;
    public SkinEntity Skin { get; private set; } = null!;

    private UserFigureSkinEntity() { }
}