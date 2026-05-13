namespace Application.Dtos;

public class UserPublicDto
{
    public Guid Id { get; set; }
    public string Login { get; set; } = null!;
    public int Rating { get; set; }
    public int Balance { get; set; }
    public int LootBoxCount { get; set; }
    public bool IsDeleted { get; set; }
}