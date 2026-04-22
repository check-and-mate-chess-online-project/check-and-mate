using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.GameSessions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;
using Core.Models.Users;

namespace Application.Services;

public class GameplayService(IGameSessionService sessionService, IGameRepository gameRepos, IUserRepository userRepos, IUnitOfWork uow) : IGameplayService
{
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<MoveResult> MakeMoveAsync(Guid gameId, Guid userId, Move move)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        MoveResult moveResult = game.MakeMove(move, userId);
        if (moveResult.IsGameOver == true) 
        {
            await ChangePlayerRatings(game, userId, (GameTerminationReason)moveResult.TerminationReason!);
            _sessionService.Remove(game);
            _gameRepos.Add(game);
            await _uow.CommitChangesAsync();
        }
        return moveResult;
    }

    public async Task HandleTimeoutAsync(Guid gameId, Guid userId)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        game.EndByTimeout(userId);
        await ChangePlayerRatings(game, userId, GameTerminationReason.Timeout);
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
        await ChangePlayerRatings(game, userId, GameTerminationReason.Resignation);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
    
    public async Task HandleDisconnectAsync(Guid gameId, Guid userId)
    {
        Game game = _sessionService.Get(gameId) ?? throw new ArgumentException($"game {gameId} not exist");
        game.EndByDisconnect(userId);
        await ChangePlayerRatings(game, userId, GameTerminationReason.Disconnect);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    private async Task ChangePlayerRatings(Game game, Guid userId, GameTerminationReason terminationReason)
    {
        User whitePlayer = await _userRepos.GetAsync(game.WhitePlayerId) ?? throw new ArgumentException($"white player not exist");
        User blackPlayer = await _userRepos.GetAsync(game.BlackPlayerId) ?? throw new ArgumentException($"black player not exist");
        GameResult gameResult = game.GetGameResultByTerminationReason(terminationReason, userId);
        (int whiteRatingDelta, int blackRatingDelta) = CalculateRating(gameResult);
        whitePlayer.ChangeRating(whiteRatingDelta);
        blackPlayer.ChangeRating(blackRatingDelta);
        _userRepos.Update(whitePlayer);
        _userRepos.Update(blackPlayer);
    }

    private (int whiteRatingDelta, int blackRatingDelta) CalculateRating(GameResult result)
    {
        int delta = 10;
        return result switch
        {
            GameResult.WhiteVictory => (delta, -delta),
            GameResult.BlackVictory => (-delta, delta),
            GameResult.Draw => (0, 0),
            _ => throw new ArgumentException("invalid game result")
        };
    }
}