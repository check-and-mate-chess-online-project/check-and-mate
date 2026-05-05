using Microsoft.AspNetCore.Mvc;
using Presentation.Requests;
using Presentation.Responces;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    private readonly IAuthService _auth = auth;

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResultDto>> Login([FromBody]LoginRequest request)
    {
        AuthResultDto authResult = await _auth.Authorize(request.Login, request.Password);
        return authResult;
    }
}