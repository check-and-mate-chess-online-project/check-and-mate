using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.GameSessions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;
using Core.Models.Users;

namespace Application.Services;

public class GameplayService(GameSessionService sessionService, IGameRepository gameRepos, IUserRepository userRepos, IUnitOfWork uow) : IGameplayService
{
    private readonly GameSessionService _sessionService = sessionService;
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<MoveResult> MakeMoveAsync(Guid gameId, Guid userId, Move move)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        MoveResult result = game.MakeMove(move, userId);
        if (result.IsGameOver == true) 
        {
            _sessionService.Remove(game);
            _gameRepos.Add(game);
            await _uow.CommitChangesAsync();
        }
        return result;
    }

    public async Task HandleTimeoutAsync(Guid gameId, Guid userId)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        game.EndByTimeout(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    public async Task HandleResignAsync(Guid gameId, Guid userId)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        game.EndByResignation(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
    
    public async Task HandleDisconnectAsync(Guid gameId, Guid userId)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        game.EndByDisconnect(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
}