using Microsoft.AspNetCore.Mvc;
using Presentation.Requests;
using Presentation.Responces;
using Application.Services.Interfaces;
using Application.Dtos;
using Core.Models.Users;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth, IRegistrationService registration) : ControllerBase
{
    private readonly IAuthService _auth = auth;
    private readonly IRegistrationService _registration = registration;

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResultDto>> Login([FromBody]LoginRequest request)
    {
        AuthResultDto authResult = await _auth.Authorize(request.Login, request.Password);
        return authResult;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResultDto>> Register([FromBody]RegisterRequest request)
    {
        AuthResultDto authResult = await _registration.RegisterAsync(request.Login, request.Password, request.Email, UserRole.Player);
        return authResult;
    }
}