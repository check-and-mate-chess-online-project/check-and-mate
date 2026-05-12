using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Presentation.Responces;
using Application.Services.Interfaces;
using Application.Dtos;

namespace Presentation.Controllers;

[ApiController]
[Authorize]
[Route("api/archive")]
public class ArchiveController(IArchiveService archive) : ControllerBase
{
    private readonly IArchiveService _archive = archive;

    [HttpGet("games")]
    [ProducesResponseType(typeof(List<GameDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> GetGames()
    {
        Guid userId = GetUserId();
        List<GameDto> games = await _archive.GetGameHistory(userId);
        return Ok(games);
    }

    private Guid GetUserId() => Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out Guid userId) 
        ? userId 
        : throw new InvalidOperationException($"invalid user identity");
}