using Application.Abstractions.Chess;
using Application.Abstractions.GameSessions;
using Application.Exceptions;
using Core.Models.Games;
using Core.Models.Interfaces;

namespace Application.Orchestration.GameSessions;

public class GameSessionService(IGameSessionStore sessionStore, IChessEngineFactory factory) : IGameSessionService
{
    private readonly IGameSessionStore _sessionStore = sessionStore;
    private readonly IChessEngineFactory _factory = factory;

    public Game? Get(Guid gameId) => _sessionStore.Get(gameId);
    
    public Game? GetByPlayers(Guid playerAId, Guid playerBId) => _sessionStore.GetByPlayers(playerAId, playerBId);

    public Game? GetByUserId(Guid userId) => _sessionStore.GetByUserId(userId);

    public Game Create(Guid whitePlayerId, Guid blackPlayerId, ITimeControl timeControl)
    {
        if (_sessionStore.GetByPlayers(whitePlayerId, blackPlayerId) != null) 
            throw new ConflictException($"game session beetwen {whitePlayerId} and {blackPlayerId} already exist");
        IChessEngine engine = _factory.CreateEngine();
        Game game = new(whitePlayerId, blackPlayerId, timeControl, engine);
        _sessionStore.Add(game);
        return game;
    }

    public void Remove(Guid gameId)
    {
        if (_sessionStore.Get(gameId) == null) throw new NotFoundException($"game session {gameId} not exist");
        _sessionStore.Remove(gameId);
    }
}