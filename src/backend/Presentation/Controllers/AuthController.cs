using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        string token = GenerateToken(Guid.NewGuid(), request.Login);
        return Ok(new { token });
    }

    private string GenerateToken(Guid userId, string login)
    {
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123456"));
        SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);
        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, login)
        ];
        JwtSecurityToken token = new(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record LoginRequest(string Login, string Password);