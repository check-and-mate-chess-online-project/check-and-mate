using Core.Services.Interfaces;
using Core.Models.Interfaces;
using Core.Models.Games;
using Core.Repositories.Interfaces;

namespace Core.Services;

public class GameService(IGameRepository gameRepository) : IGameService
{
    private readonly IGameRepository _gameRepos = gameRepository;

    public async Task<Game?> GetGameAsync(Guid gameId) => await _gameRepos.GetAsync(gameId);

    public async Task<List<Game>> GetByUserIdAsync(Guid gameId) => await _gameRepos.GetByUserIdAsync(gameId);

    public void AddGame(Guid whitePlayerId, Guid blackPlayerId, IChessEngine engine, ITimeControl timeControl)
    {
        Game game = new(whitePlayerId, blackPlayerId, engine, timeControl);
        _gameRepos.Add(game);
    }
}