using Application.Services.Interfaces;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Orchestration.GameSessions;
using Application.Orchestration.RatingCalculation;
using Application.Dtos;
using Application.Mappers;
using Application.Exceptions;
using Application.Models;
using Core.Repositories;
using Core.Models.Chess;
using Core.Models.Games;
using Core.Models.Users;

namespace Application.Services;

public class GameplayService(
    IGameSettingsProvider settings, 
    IGameSessionService sessionService,
    IRatingCalculator calculator,
    IGameRepository gameRepos, 
    IUserRepository userRepos, 
    IUnitOfWork uow) : IGameplayService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IRatingCalculator _calculator = calculator;
    private readonly IGameRepository _gameRepos = gameRepos;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task<GameDto?> GetActiveGameByUser(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        return game != null ? (await GameMapper.ToDto(game, _userRepos)) : null;
    }

    public async Task<MoveResultDto> MakeMoveAsync(Guid userId, int A, int B, int X, int Y, MoveOptionsDto moveOptions)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        Game game = _sessionService.GetByUserId(userId) ?? throw new NotFoundException($"active game not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        Move move = new(A, B, X, Y, MoveOptionsMapper.ToDomain(moveOptions));
        MoveResult moveResult = game.MakeMove(move, userId);
        if (moveResult.IsGameOver == true) 
        {
            await HandleGameCompletion(game, userId, (GameTerminationReason)moveResult.TerminationReason!);
            await _uow.CommitChangesAsync();
        }
        return MoveResultMapper.ToDto(moveResult, await GameMapper.ToDto(game, _userRepos));
    }

    public async Task<GameDto?> HandleTimeoutAsync(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        if (game == null) return null;
        game.EndByTimeout(userId);
        await HandleGameCompletion(game, userId, GameTerminationReason.Timeout);
        await _uow.CommitChangesAsync();
        return await GameMapper.ToDto(game, _userRepos);
    }

    public async Task<GameDto> HandleResignAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        Game game = _sessionService.GetByUserId(userId) ?? throw new NotFoundException($"active game not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        game.EndByResignation(userId);
        await HandleGameCompletion(game, userId, GameTerminationReason.Resignation);
        await _uow.CommitChangesAsync();
        return await GameMapper.ToDto(game, _userRepos);
    }
    
    public async Task<GameDto?> HandleDisconnectAsync(Guid userId)
    {
        Game? game = _sessionService.GetByUserId(userId);
        if (game == null) return null;
        game.EndByDisconnect(userId);
        await HandleGameCompletion(game, userId, GameTerminationReason.Disconnect);
        await _uow.CommitChangesAsync();
        Console.WriteLine($"{game.StartTimeUtc} \n {game.EndTimeUtc} \n {game.TerminationReason}");
        return await GameMapper.ToDto(game, _userRepos);
    }

    private async Task HandleGameCompletion(Game game, Guid userId, GameTerminationReason terminationReason)
    {
        await UpdatePlayerStats(game, userId, GameTerminationReason.Resignation);
        _sessionService.Remove(game.Id);
        _gameRepos.Add(game);
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
        RatingResult result = _calculator.CalculateRating(whitePlayer.Rating, blackPlayer.Rating, gameResult);
        whitePlayer.ChangeRating(result.WhiteRatingDelta);
        blackPlayer.ChangeRating(result.BlackRatingDelta);
        _userRepos.Update(whitePlayer);
        _userRepos.Update(blackPlayer);
    }
}