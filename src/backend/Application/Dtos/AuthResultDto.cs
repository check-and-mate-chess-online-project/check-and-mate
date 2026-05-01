namespace Application.Dtos;

public class AuthResultDto
{
    public UserDto User { get; init; } = null!;
    public string Token { get; init; } = null!;
}