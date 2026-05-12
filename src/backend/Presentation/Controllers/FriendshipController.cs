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
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<FriendRequestDto>>> GetPendingFriendRequests()
    {
        Guid userId = GetUserId();
        List<FriendRequestDto> requests = await _friendship.GetPendingFriendRequestsAsync(userId);
        return requests;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<List<Guid>>> GetFriends()
    {
        Guid userId = GetUserId();
        List<Guid> friendIds = await _friendship.GetAllFriendsAsync(userId);
        return friendIds;
    }

    [HttpPost("requests")]
    [ProducesResponseType(typeof(FriendRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status410Gone)]
    public async Task<ActionResult<FriendRequestDto>> SendFriendRequest([FromBody]FriendRequest request)
    {
        Guid userId = GetUserId();
        FriendRequestDto friendRequest;
        if (request.ReceiverId != null)
        {
            friendRequest = await _friendship.SendFriendRequestAsync(userId, request.ReceiverId.Value);
        }
        else if (request.ReceiverLogin != null)
        {
            friendRequest = await _friendship.SendFriendRequestAsync(userId, request.ReceiverLogin);
        }
        else throw new ArgumentException("id or login must be specified");
        return friendRequest;
    }

    [HttpPatch("requests/{friendRequestId}/accept")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> AcceptFriendRequest([FromRoute]Guid friendRequestId)
    {
        await _friendship.AcceptFriendRequestAsync(friendRequestId);
        return NoContent();
    }

    [HttpPatch("requests/{friendRequestId}/reject")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> RejectFriendRequest([FromRoute]Guid friendRequestId)
    {
        await _friendship.RejectFriendRequestAsync(friendRequestId);
        return NoContent();
    }

    [HttpDelete("{friendId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> DeleteFriend([FromRoute]Guid friendId)
    {
        Guid userId = GetUserId();
        await _friendship.RemoveFriendAsync(userId, friendId);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out Guid userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}