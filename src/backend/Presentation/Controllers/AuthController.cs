using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Presentation.Requests;
using Application.Services.Interfaces;
using Application.Dtos;
using Infrastructure.Settings;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IOptions<JwtTokenSettings> jwtOptions, IUserAuthService auth) : ControllerBase
{
    private readonly JwtTokenSettings _jwtSettings = jwtOptions.Value;
    private readonly IUserAuthService _auth = auth;

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        UserDto? user = await _auth.Authorize(request.Login, request.Password);
        if (user == null) return Unauthorized("incorrect login or password");        
        string token = GenerateToken(user.Id, user.Login);
        return Ok(new { token });
    }

    private string GenerateToken(Guid userId, string login)
    {
        SymmetricSecurityKey key = new(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        SigningCredentials creds = new(key, SecurityAlgorithms.HmacSha256);
        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Name, login),
            new(JwtRegisteredClaimNames.Iss, _jwtSettings.Issuer),
            new(JwtRegisteredClaimNames.Aud, _jwtSettings.Audience)
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