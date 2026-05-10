namespace Application.Dtos;

public class AuthResultDto
{
    public UserDto User { get; set; } = null!;
    public string Token { get; set; } = null!;
}