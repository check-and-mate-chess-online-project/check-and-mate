using Core.Repositories;
using Core.Models.Games;

namespace Infrastructure.Persistence.InMemory;

public class GameRepository : IGameRepository
{
    private readonly Dictionary<Guid, Game> _games = new();

    public Task<Game?> GetAsync(Guid gameId)
    {
        _games.TryGetValue(gameId, out var game);
        return Task.FromResult(game);
    }

    public Task<Game?> GetByPlayersAsync(Guid playerAId, Guid playerBId)
    {
        var game = _games.Values.FirstOrDefault(g =>
            (g.WhitePlayerId == playerAId && g.BlackPlayerId == playerBId) ||
            (g.WhitePlayerId == playerBId && g.BlackPlayerId == playerAId));

        return Task.FromResult(game);
    }

    public Task<List<Game>> GetByUserIdAsync(Guid userId)
    {
        var games = _games.Values
            .Where(g => g.WhitePlayerId == userId || g.BlackPlayerId == userId)
            .ToList();

        return Task.FromResult(games);
    }

    public void Add(Game game)
    {
        _games[game.Id] = game;
    }
}