using Core.Models.Users;

namespace Application.Dtos;

public class UserDto
{
    public Guid Id { get; set; }
    public string Login { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int Rating { get; set; }
    public int Balance { get; set; }
    public int LootBoxCount { get; set; }
    public UserRole Role { get; set; }
    public bool IsDeleted { get; set; }
}