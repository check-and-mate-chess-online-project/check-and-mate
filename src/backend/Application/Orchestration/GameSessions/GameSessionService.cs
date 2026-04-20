using Application.Abstractions.GameSessions;
using Application.Abstractions.UnitOfWork;
using Core.Models.Games;
using Core.Models.Interfaces;

namespace Application.Orchestration.GameSessions;

public class GameSessionService(IGameSessionStore sessionStore, IChessEngine engine, IUnitOfWork uow)
{
    private readonly IGameSessionStore _sessionStore = sessionStore;
    private readonly IChessEngine _engine = engine;
    private readonly IUnitOfWork _uow = uow;

    public Game? Get(Guid gameId) => _sessionStore.Get(gameId);
    
    public Game? GetByPlayers(Guid playerAId, Guid playerBId) => _sessionStore.GetByPlayers(playerAId, playerBId);

    public Game Create(Guid whitePlayerId, Guid blackPlayerId, ITimeControl timeControl)
    {
        if (_sessionStore.GetByPlayers(whitePlayerId, blackPlayerId) != null) throw new InvalidOperationException($"game session beetwen {whitePlayerId} and {blackPlayerId} already exist");
        Game game = new(whitePlayerId, blackPlayerId, _engine, timeControl);
        _sessionStore.Add(game);
        return game;
    }

    public void Remove(Game game)
    {
        if (_sessionStore.Get(game.Id) == null) throw new ArgumentException($"game session {game.Id} not exist");
        _sessionStore.Remove(game);
    }
}