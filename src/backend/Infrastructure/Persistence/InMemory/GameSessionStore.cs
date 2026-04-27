using Application.Abstractions.GameSessions;
using Core.Models.Games;

namespace Infrastructure.Persistence.InMemory;

public class GameSessionStore : IGameSessionStore
{
    private readonly List<Game> _games = [];

    public Game? Get(Guid gameId) => _games.FirstOrDefault(g => g.Id == gameId);

    public Game? GetByPlayers(Guid playerAId, Guid playerBId) => _games.FirstOrDefault(g =>
        (g.WhitePlayerId == playerAId && g.BlackPlayerId == playerBId) ||
        (g.WhitePlayerId == playerBId && g.BlackPlayerId == playerAId));

    public Game? GetByUserId(Guid userId) => _games.FirstOrDefault(g => g.WhitePlayerId == userId || g.BlackPlayerId == userId);

    public void Add(Game game) => _games.Add(game);

    public void Update(Game game)
    {
        int index = _games.FindIndex(g => g.Id == game.Id);
        if (index == -1) throw new ArgumentException($"game {game.Id} not exist");
        _games[index] = game;
    }

    public void Remove(Game game) => _games.Remove(game);
}