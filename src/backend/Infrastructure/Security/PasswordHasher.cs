using Microsoft.AspNetCore.Identity;
using Application.Abstractions.Security;

namespace Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<object> _hasher = new();

    public string GetHash(string password) => _hasher.HashPassword(new object(), password);

    public bool VerifyPassword(string password, string hash)
    {
        PasswordVerificationResult result = _hasher.VerifyHashedPassword(new object(), hash, password);
        return result == PasswordVerificationResult.Success;
    }
}