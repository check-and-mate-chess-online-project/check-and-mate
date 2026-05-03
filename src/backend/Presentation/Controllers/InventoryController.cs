using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Requests;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/inventory")]
public class InventoryController(IUserInventoryService inventory, ILootBoxService loot, IUserSkinConfigurationService configuration) : ControllerBase
{
    private readonly IUserInventoryService _inventory = inventory;
    private readonly ILootBoxService _loot = loot;
    private readonly IUserSkinConfigurationService _configuration = configuration;

    [HttpGet("skins")]
    public async Task<ActionResult<List<SkinDto>>> GetUserSkins()
    {
        Guid userId = GetUserId();
        List<SkinDto> skins = await _inventory.GetUserSkinsAsync(userId);
        return skins;
    }

    [HttpPost("lootboxes/open")]
    public async Task<ActionResult<LootBoxDropResultDto>> OpenLootBox()
    {
        Guid userId = GetUserId();
        LootBoxDropResultDto drop = await _loot.OpenUserLootBoxAsync(userId);
        return drop;
    }

    [HttpPost("skins/equip")]
    [ProducesResponseType(204)]
    public async Task<ActionResult> EquipSkin([FromBody]EquipSkinRequest request)
    {
        Guid userId = GetUserId();
        await _configuration.ChangeFigureSkinAsync(userId, request.Figure, request.SkinId);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) 
        ? userId 
        : throw new UnauthorizedAccessException($"invalid user identity");
}