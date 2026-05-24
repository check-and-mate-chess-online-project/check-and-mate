namespace Infrastructure.Persistence.EfCore.Entities;

public class SkinEntity
{
    public Guid Id { get; private set; }
    public Guid SetId { get; private set; }
    public string Name { get; private set; } = null!;
    public string? Description { get; private set; } = null!;
    public int Figure { get; private set; }
    public int Rarity { get; private set; }
    public byte[] WhiteBoardImage { get; private set; } = null!;
    public byte[] BlackBoardImage { get; private set; } = null!;
    public byte[] IdleImage { get; private set; } = null!;
    public byte[] StartFightWinImage { get; private set; } = null!;
    public byte[] StartFightLoseImage { get; private set; } = null!;
    public byte[] EndFightWinImage { get; private set; } = null!;
    public byte[] EndFightLoseImage { get; private set; } = null!;
    public bool IsDefault { get; private set; }

    public SkinSetEntity Set { get; private set; } = null!;
    public ICollection<UserSkinEntity> Owners { get; private set; } = [];

    private SkinEntity() { }

    public static SkinEntity Create(
        Guid id,
        Guid setId,
        string name,
        string? description,
        int figure,
        int rarity,
        byte[] wbi,
        byte[] bbi,
        byte[] ii,
        byte[] sfwi,
        byte[] sfli,
        byte[] efwi,
        byte[] efli,
        bool IsDefault
    ) => new()
    {
        Id = id,
        SetId = setId,
        Name = name,
        Description = description,
        Figure = figure,
        Rarity = rarity,
        WhiteBoardImage = wbi,
        BlackBoardImage = bbi,
        IdleImage = ii,
        StartFightWinImage = sfwi,
        StartFightLoseImage = sfli,
        EndFightWinImage = efwi,
        EndFightLoseImage = efli,
        IsDefault = IsDefault
    };
}