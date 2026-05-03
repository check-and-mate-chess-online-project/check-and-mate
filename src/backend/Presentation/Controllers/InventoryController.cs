using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory")]
public class InventoryController(IUserInventoryService inventory, ILootBoxService loot) : ControllerBase
{
    private readonly IUserInventoryService _inventory = inventory;
    private readonly ILootBoxService _loot = loot;

    [HttpGet("skins")]
    public async Task<IActionResult> GetUserSkins()
    {
        Guid userId = GetUserId();
        List<SkinDto> skins = await _inventory.GetUserSkinsAsync(userId);
        return Ok(skins);
    }

    [HttpPost("lootboxes/open")]
    public async Task<IActionResult> OpenLootBox()
    {
        Guid userId = GetUserId();
        LootBoxDropResultDto drop = await _loot.OpenUserLootBoxAsync(userId);
        return Ok(drop);
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}