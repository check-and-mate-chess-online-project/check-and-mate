using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Orchestration.GameSessions;
using Application.Dtos;
using Application.Mappers;
using Application.Exceptions;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;
using Core.Models.Users;

namespace Application.Services;

public class GameplayService(
    IGameSettingsProvider settings, 
    IGameSessionService sessionService, 
    IGameRepository gameRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IGameplayService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public GameDto? GetActiveGameByUser(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        return game != null ? GameMapper.GetDto(game) : null;
    }

    public async Task<MoveResultDto> MakeMoveAsync(Guid userId, Move move)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        Game game = _sessionService.GetByUserId(userId) ?? throw new NotFoundException($"active game not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        MoveResult moveResult = game.MakeMove(move, userId);
        if (moveResult.IsGameOver == true) 
        {
            await UpdatePlayerStats(game, userId, (GameTerminationReason)moveResult.TerminationReason!);
            _sessionService.Remove(game);
            _gameRepos.Add(game);
            await _uow.CommitChangesAsync();
        }
        return MoveResultMapper.GetDto(moveResult);
    }

    public async Task HandleTimeoutAsync(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        if (game == null) return;
        game.EndByTimeout(userId);
        await UpdatePlayerStats(game, userId, GameTerminationReason.Timeout);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    public async Task HandleResignAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        Game game = _sessionService.GetByUserId(userId) ?? throw new NotFoundException($"active game not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        game.EndByResignation(userId);
        await UpdatePlayerStats(game, userId, GameTerminationReason.Resignation);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }
    
    public async Task HandleDisconnectAsync(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        if (game == null) return;
        game.EndByDisconnect(userId);
        await UpdatePlayerStats(game, userId, GameTerminationReason.Disconnect);
        _sessionService.Remove(game);
        _gameRepos.Add(game);
        await _uow.CommitChangesAsync();
    }

    private async Task UpdatePlayerStats(Game game, Guid userId, GameTerminationReason terminationReason)
    {
        User whitePlayer = await _userRepos.GetAsync(game.WhitePlayerId) ?? throw new NotFoundException($"white player not found");
        User blackPlayer = await _userRepos.GetAsync(game.BlackPlayerId) ?? throw new NotFoundException($"black player not found");
        GameResult gameResult = game.GetGameResultByTerminationReason(terminationReason, userId);
        await ChangePlayerRatings(whitePlayer, blackPlayer, gameResult);
        User winner = gameResult == GameResult.WhiteVictory ? whitePlayer : blackPlayer;
        User loser = gameResult == GameResult.WhiteVictory ? blackPlayer : whitePlayer;
        AddPlayerBalances(winner, loser);
    }

    private void AddPlayerBalances(User winner, User loser)
    {
        winner.AddBalance(_settings.GameWinReward);
        winner.AddBalance(_settings.GameLoseReward);
        _userRepos.Update(winner);
        _userRepos.Update(loser);
    }

    private async Task ChangePlayerRatings(User whitePlayer, User blackPlayer, GameResult gameResult)
    {
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