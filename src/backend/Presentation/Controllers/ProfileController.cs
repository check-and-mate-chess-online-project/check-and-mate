using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Requests;
using Application.Dtos;
using Application.Services.Interfaces;

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
        Guid userId = GetUserId();
        UserDto user = await _profileService.GetUserProfile(userId);
        return Ok(user);
    }

    [HttpPatch("login")]
    public async Task<IActionResult> ChangeLogin([FromBody]ChangeLoginRequest request)
    {
        Guid userId = GetUserId();
        await _profileService.ChangeUserLoginAsync(userId, request.Login);
        return NoContent();
    }

    [HttpPatch("password")]
    public async Task<IActionResult> ChangePassword([FromBody]ChangePasswordRequest request)
    {
        Guid userId = GetUserId();
        await _profileService.ChangeUserPasswordAsync(userId, request.OldPassword, request.NewPassword);
        return NoContent();
    }

    [HttpPatch("email")]
    public async Task<IActionResult> ChangeEmail([FromBody]ChangeEmailRequest request)
    {
        Guid userId = GetUserId();
        await _profileService.ChangeUserEmailAsync(userId, request.Email);
        return NoContent();
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteAccount([FromBody]DeleteAccountRequest request)
    {
        Guid userId = GetUserId();
        await _profileService.RemoveUserAsync(userId, request.Password);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}