using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Requests;
using Presentation.Responces;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/friends")]
public class FriendshipController(IFriendshipService friendship) : ControllerBase
{
    private readonly IFriendshipService _friendship = friendship;

    [HttpGet("requests")]
    [ProducesResponseType(typeof(List<FriendRequestDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<FriendRequestDto>>> GetPendingFriendRequests()
    {
        Guid userId = GetUserId();
        List<FriendRequestDto> requests = await _friendship.GetPendingFriendRequestsAsync(userId);
        return requests;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<UserPublicDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<UserPublicDto>>> GetFriends()
    {
        Guid userId = GetUserId();
        List<UserPublicDto> friendIds = await _friendship.GetAllFriendsAsync(userId);
        return friendIds;
    }

    [HttpPost("requests")]
    [ProducesResponseType(typeof(FriendRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status410Gone)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<FriendRequestDto>> SendFriendRequest([FromBody]FriendRequest request)
    {
        Guid userId = GetUserId();
        FriendRequestDto friendRequest = await _friendship.SendFriendRequestAsync(userId, request.ReceiverLogin);
        return friendRequest;
    }

    [HttpPatch("requests/{friendRequestId}/accept")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> AcceptFriendRequest([FromRoute]Guid friendRequestId)
    {
        Guid userId = GetUserId();
        await _friendship.AcceptFriendRequestAsync(userId, friendRequestId);
        return NoContent();
    }

    [HttpPatch("requests/{friendRequestId}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> RejectFriendRequest([FromRoute]Guid friendRequestId)
    {
        Guid userId = GetUserId();
        await _friendship.RejectFriendRequestAsync(userId, friendRequestId);
        return NoContent();
    }

    [HttpDelete("{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> DeleteFriend([FromRoute]Guid friendId)
    {
        Guid userId = GetUserId();
        await _friendship.RemoveFriendAsync(userId, friendId);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out Guid userId) 
        ? userId 
        : throw new InvalidOperationException($"invalid user identity");
}