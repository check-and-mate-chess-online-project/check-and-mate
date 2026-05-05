using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Requests;
using Presentation.Responces;
using Application.Services.Interfaces;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/shop")]
public class ShopController(ILootBoxService loot) : ControllerBase
{
    private readonly ILootBoxService _loot = loot;

    [HttpPost("lootboxes/buy")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status410Gone)]
    public async Task<ActionResult> BuyLootBoxes([FromBody]BuyLootBoxesRequest request)
    {
        Guid userId = GetUserId();
        await _loot.BuyLootBoxesAsync(userId, request.Count);
        return Ok();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}