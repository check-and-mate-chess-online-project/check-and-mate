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
[Route("api/inventory")]
public class InventoryController(IInventoryService inventory, ILootBoxService loot, ISkinConfigurationService configuration) : ControllerBase
{
    private readonly IInventoryService _inventory = inventory;
    private readonly ILootBoxService _loot = loot;
    private readonly ISkinConfigurationService _configuration = configuration;

    [HttpGet("skins")]
    [ProducesResponseType(typeof(List<SkinDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<SkinDto>>> GetUserSkins()
    {
        Guid userId = GetUserId();
        List<SkinDto> skins = await _inventory.GetUserSkinsAsync(userId);
        return skins;
    }

    [HttpPost("lootboxes/open")]
    [ProducesResponseType(typeof(LootBoxDropResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status410Gone)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LootBoxDropResultDto>> OpenLootBox()
    {
        Guid userId = GetUserId();
        LootBoxDropResultDto drop = await _loot.OpenUserLootBoxAsync(userId);
        return drop;
    }

    [HttpPost("skins/equip")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponce), StatusCodes.Status410Gone)]
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