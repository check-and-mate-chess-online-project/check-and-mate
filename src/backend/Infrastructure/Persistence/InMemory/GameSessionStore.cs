using Application.Abstractions.GameSessions;
using Core.Models.Games;

namespace Infrastructure.Persistence.InMemory;

public class GameSessionStore : IGameSessionStore
{
    private readonly Dictionary<Guid, Game> _games = new();

    public Game? Get(Guid gameId)
    {
        _games.TryGetValue(gameId, out var game);
        return game;
    }

    public Game? GetByPlayers(Guid playerAId, Guid playerBId)
    {
        return _games.Values.FirstOrDefault(g =>
            (g.WhitePlayerId == playerAId && g.BlackPlayerId == playerBId) ||
            (g.WhitePlayerId == playerBId && g.BlackPlayerId == playerAId));
    }

    public Game? GetByUserId(Guid userId)
    {
        return _games.Values.FirstOrDefault(g =>
            g.WhitePlayerId == userId || g.BlackPlayerId == userId);
    }

    public void Add(Game game)
    {
        _games[game.Id] = game;
    }

    public void Update()
    {
    }

    public void Remove(Game game)
    {
        _games.Remove(game.Id);
    }
}