using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Requests;
using Application.Services.Interfaces;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/shop")]
public class ShopController(ILootBoxService loot) : ControllerBase
{
    private readonly ILootBoxService _loot = loot;

    [HttpPost("lootboxes/buy")]
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