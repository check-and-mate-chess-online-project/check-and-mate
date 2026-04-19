using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Services;

public class GameplayService(IGameRepository gameRepos, IUnitOfWork uow) : IGameplayService
{
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<MoveResult> MakeMoveAsync(Game game, Guid userId, Move move)
    {
        MoveResult result = game.MakeMove(move, userId);
        if (result.IsGameOver == true) 
        {
            _gameRepos.Add(game);
            await _uow.CommitChangesAsync();
        }
        return result;
    }

    public async Task HandleTimeoutAsync(Game game, Guid userId)
    {
        game.EndByTimeout(userId);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    public async Task HandleResignAsync(Game game, Guid userId)
    {
        game.EndByResignation(userId);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
    
    public async Task HandleDisconnectAsync(Game game, Guid userId)
    {
        game.EndByDisconnect(userId);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
}