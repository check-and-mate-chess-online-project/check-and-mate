using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.GameSessions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Services;

public class GameplayService(GameSessionService sessionService, IGameRepository gameRepos, IUnitOfWork uow) : IGameplayService
{
    private readonly GameSessionService _sessionService = sessionService;
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<MoveResult> MakeMoveAsync(Game game, Guid userId, Move move)
    {
        MoveResult result = game.MakeMove(move, userId);
        if (result.IsGameOver == true) 
        {
            _sessionService.Remove(game);
            _gameRepos.Add(game);
            await _uow.CommitChangesAsync();
        }
        return result;
    }

    public async Task HandleTimeoutAsync(Game game, Guid userId)
    {
        game.EndByTimeout(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    public async Task HandleResignAsync(Game game, Guid userId)
    {
        game.EndByResignation(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
    
    public async Task HandleDisconnectAsync(Game game, Guid userId)
    {
        game.EndByDisconnect(userId);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
}