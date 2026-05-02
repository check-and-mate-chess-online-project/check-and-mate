using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Abstractions.Tokens;
using Infrastructure.Settings;

namespace Infrastructure.Security;

public class JwtTokenGenerator(IOptions<JwtTokenSettings> jwtOptions) : ITokenGenerator
{
    private readonly JwtTokenSettings _jwtSettings = jwtOptions.Value;

    public string GenerateToken(Guid userId, string login)
    {
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);
        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, login)
        ];
        JwtSecurityToken token = new(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}