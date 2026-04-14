namespace Core.Security;

public interface IPasswordHasher
{
    string GetHash(string password);
    bool VerifyPassword(string password, string hash);
}