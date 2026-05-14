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
public class InventoryController(IInventoryService inventory, ILootBoxService loot) : ControllerBase
{
    private readonly IInventoryService _inventory = inventory;
    private readonly ILootBoxService _loot = loot;

    [HttpGet("skins")]
    [ProducesResponseType(typeof(List<SkinDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<SkinDto>>> GetUserSkins()
    {
        Guid userId = GetUserId();
        List<SkinDto> skins = await _inventory.GetUserSkinsAsync(userId);
        return skins;
    }

    [HttpGet("skins/{login}")]
    [ProducesResponseType(typeof(List<SkinDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<SkinDto>>> GetUserSkins([FromRoute]string login)
    {
        List<SkinDto> skins = await _inventory.GetUserSkinsAsync(login);
        return skins;
    }

    [HttpGet("skins/current")]
    [ProducesResponseType(typeof(SkinConfigurationDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status410Gone)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SkinConfigurationDto>> GetConfiguration()
    {
        Guid userId = GetUserId();
        SkinConfigurationDto configuration = await _inventory.GetConfigurationAsync(userId);
        return configuration;
    }

    [HttpPost("lootboxes/open")]
    [ProducesResponseType(typeof(LootBoxDropResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status410Gone)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LootBoxDropResultDto>> OpenLootBox()
    {
        Guid userId = GetUserId();
        LootBoxDropResultDto drop = await _loot.OpenUserLootBoxAsync(userId);
        return drop;
    }

    [HttpPost("skins/equip")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status410Gone)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> EquipSkin([FromBody]EquipSkinRequest request)
    {
        Guid userId = GetUserId();
        await _inventory.ChangeFigureSkinAsync(userId, request.Figure, request.SkinId);
        return NoContent();
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out Guid userId) 
        ? userId 
        : throw new InvalidOperationException($"invalid user identity");
}