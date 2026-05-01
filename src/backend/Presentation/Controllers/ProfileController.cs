using System.Security.Claims;
using Application.Dtos;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController(IUserProfileService profileService) : ControllerBase
{
    private readonly IUserProfileService _profileService = profileService;

    [HttpGet("me")]
    public async Task<IActionResult> GetUserProfile()
    {
        string? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out Guid userId)) return Unauthorized("invalid token");
        UserDto user = await _profileService.GetUserProfile(userId);
        return Ok(user);
    }
}