using Application.Services.Interfaces;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Games;

namespace Application.Services;

public class ArchiveService(IGameRepository gameRepos) : IArchiveService
{
    private readonly IGameRepository _gameRepos = gameRepos;

    public async Task<List<GameDto>> GetGameHistory(Guid userId)
    {
        List<Game> games = await _gameRepos.GetByUserIdAsync(userId);
        return [.. games.Select(GameMapper.ToDto)];
    }
}