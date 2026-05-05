namespace Application.Abstractions.Tokens;

public interface ITokenGenerator
{
    string GenerateToken(Guid userId, string login);
}