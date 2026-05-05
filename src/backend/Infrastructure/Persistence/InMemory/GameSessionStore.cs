using System.Collections.Concurrent;
using Application.Abstractions.GameSessions;
using Core.Models.Games;

namespace Infrastructure.Persistence.InMemory;

public class GameSessionStore : IGameSessionStore
{
    private readonly ConcurrentDictionary<Guid, Game> _games = [];

    public Game? Get(Guid gameId) => _games[gameId];

    public Game? GetByPlayers(Guid playerAId, Guid playerBId) => _games.FirstOrDefault(g =>
        (g.Value.WhitePlayerId == playerAId && g.Value.BlackPlayerId == playerBId) ||
        (g.Value.WhitePlayerId == playerBId && g.Value.BlackPlayerId == playerAId)).Value;

    public Game? GetByUserId(Guid userId) => _games.FirstOrDefault(g => g.Value.WhitePlayerId == userId || g.Value.BlackPlayerId == userId).Value;

    public List<Game> GetAll() => [.. _games.Values];

    public void Add(Game game) => _games[game.Id] = game;

    public void Update(Game game) => _games[game.Id] = game;

    public void Remove(Game game) => _games.Remove(game.Id, out _);
}