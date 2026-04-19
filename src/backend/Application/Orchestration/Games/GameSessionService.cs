using Application.Abstractions.GameSessions;
using Application.Abstractions.UnitOfWork;
using Core.Models.Games;
using Core.Models.Interfaces;

namespace Application.Orchestration.Games;

public class GameSessionService(IGameSessionStore sessionStore, IChessEngine engine, IUnitOfWork uow)
{
    private readonly IGameSessionStore _sessionStore = sessionStore;
    private readonly IChessEngine _engine = engine;
    private readonly IUnitOfWork _uow = uow;
    
    public Game? GetByPlayers(Guid playerAId, Guid playerBId) => _sessionStore.GetByPlayers(playerAId, playerBId);

    public Game Create(Guid whitePlayerId, Guid blackPlayerId, ITimeControl timeControl)
    {
        if (_sessionStore.GetByPlayers(whitePlayerId, blackPlayerId) != null) throw new InvalidOperationException($"game session beetwen {whitePlayerId} and {blackPlayerId} already exist");
        Game game = new(whitePlayerId, blackPlayerId, _engine, timeControl);
        _sessionStore.Add(game);
        return game;
    }
}