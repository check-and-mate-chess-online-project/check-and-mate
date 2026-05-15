using Application.Services.Interfaces;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Games;

namespace Application.Services;

public class ArchiveService(IGameRepository gameRepos, IUserRepository userRepos) : IArchiveService
{
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUserRepository _userRepos = userRepos;

    public async Task<List<GameDto>> GetGameHistory(Guid userId)
    {
        List<Game> games = await _gameRepos.GetByUserIdAsync(userId);
        List<GameDto> gameDtos = [];
        foreach (var game in games)
        {
            GameDto gameDto = await GameMapper.ToDto(game, _userRepos);
            gameDtos.Add(gameDto);
        }
        return gameDtos;
    }
}