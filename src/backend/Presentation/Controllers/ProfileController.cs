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
public class ProfileController(IUserProfileService profile) : ControllerBase
{
    private readonly IUserProfileService _profile = profile;

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetUserProfile()
    {
        Guid userId = GetUserId();
        UserDto user = await _profile.GetUserProfile(userId);
        return user;
    }

    [HttpPatch("login")]
    [ProducesResponseType(204)]
    public async Task<ActionResult> ChangeLogin([FromBody]ChangeLoginRequest request)
    {
        Guid userId = GetUserId();
        await _profile.ChangeUserLoginAsync(userId, request.Login);
        return NoContent();
    }

    [HttpPatch("password")]
    [ProducesResponseType(204)]
    public async Task<ActionResult> ChangePassword([FromBody]ChangePasswordRequest request)
    {
        Guid userId = GetUserId();
        await _profile.ChangeUserPasswordAsync(userId, request.OldPassword, request.NewPassword);
        return NoContent();
    }

    [HttpPatch("email")]
    [ProducesResponseType(204)]
    public async Task<ActionResult> ChangeEmail([FromBody]ChangeEmailRequest request)
    {
        Guid userId = GetUserId();
        await _profile.ChangeUserEmailAsync(userId, request.Email);
        return NoContent();
    }

    [HttpDelete("me")]
    [ProducesResponseType(204)]
    public async Task<ActionResult> DeleteAccount([FromBody]DeleteAccountRequest request)
    {
        Guid userId = GetUserId();
        await _profile.RemoveUserAsync(userId, request.Password);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}