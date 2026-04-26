using System.Security.Cryptography;
using System.Text;
using Application.Abstractions.Security;

namespace Infrastructure.Security;

public class SimplePasswordHasher : IPasswordHasher
{
    public string GetHash(string password)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha.ComputeHash(bytes);

        return Convert.ToBase64String(hash);
    }

    public bool VerifyPassword(string password, string hash)
    {
        var newHash = GetHash(password);
        return newHash == hash;
    }
}