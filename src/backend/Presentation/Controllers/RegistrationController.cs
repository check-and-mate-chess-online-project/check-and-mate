using Microsoft.AspNetCore.Mvc;
using Presentation.Requests;
using Application.Services.Interfaces;
using Core.Models.Users;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class RegistrationController(IUserRegistrationService registration) : ControllerBase
{
    private readonly IUserRegistrationService _registration = registration;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        AuthResultDto authResult = await _registration.RegisterAsync(request.Login, request.Password, request.Email, UserRole.Player);
        return Ok( new { authResult } );
    }
}