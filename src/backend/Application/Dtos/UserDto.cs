using Core.Models.Users;

namespace Application.Dtos;

public class UserDto
{
    public Guid Id { get; init; }
    public string Login { get; init; } = null!;
    public string Email { get; init; } = null!;
    public int Rating { get; init; }
    public int Balance { get; init; }
    public int LootBoxCount { get; init; }
    public UserRole Role { get; init; }
    public bool IsDeleted { get; init; }
}