using Microsoft.AspNetCore.Mvc;
using Presentation.Requests;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IUserAuthService auth) : ControllerBase
{
    private readonly IUserAuthService _auth = auth;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        AuthResultDto authResult = await _auth.Authorize(request.Login, request.Password);
        return Ok(new { authResult });
    }
}