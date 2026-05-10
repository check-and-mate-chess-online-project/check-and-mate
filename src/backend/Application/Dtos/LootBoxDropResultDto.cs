namespace Application.Dtos;

public class LootBoxDropResultDto
{
    public SkinDto Skin { get; set; } = null!;
    public bool IsDuplicate { get; set; }
}