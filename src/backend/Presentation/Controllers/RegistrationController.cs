using Microsoft.AspNetCore.Mvc;
using Presentation.Requests;
using Presentation.Responces;
using Application.Services.Interfaces;
using Core.Models.Users;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class RegistrationController(IRegistrationService registration) : ControllerBase
{
    private readonly IRegistrationService _registration = registration;

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResultDto>> Register([FromBody]RegisterRequest request)
    {
        AuthResultDto authResult = await _registration.RegisterAsync(request.Login, request.Password, request.Email, UserRole.Player);
        return authResult;
    }
}