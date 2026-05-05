namespace Application.Dtos;

public class LootBoxDropResultDto
{
    public SkinDto Skin { get; init; } = null!;
    public bool IsDuplicate { get; init; }
}