using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Abstractions.Events;
using Application.Events;
using Application.Mappers;
using Application.Exceptions;
using Application.Models;
using Core.Repositories;
using Core.Models.Games;
using Core.Models.Users;
using Core.Models.Interfaces;

namespace Application.Services;

public class MatchmakingService(
    IGameSettingsProvider settings,
    IEventDispatcher eventDispatcher,
    IGameSessionService sessionService, 
    IUserRepository userRepos, 
    IMatchmakingPool pool, 
    IUnitOfWork uow) : IMatchmakingService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly IEventDispatcher _eventDispatcher = eventDispatcher;
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IMatchmakingPool _pool = pool;
    private readonly IUnitOfWork _uow = uow;
    private readonly Lock _matchLock = new();

    public async Task StartOpponentSearchAsync(Guid userId, bool timeControlEnabled, int initialTimeSec, int incrementPerMoveSec)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        if (user.IsDeleted) throw new UserDeletedException($"user {userId} is deleted");
        if (_pool.ContainsUser(user.Id)) throw new ConflictException("already searching for an opponent");
        if (_sessionService.GetByUserId(userId) != null) throw new ConflictException($"user {userId} already in game");
        ITimeControl timeControl;
        if (timeControlEnabled)
        {
            if (initialTimeSec <= 0 || incrementPerMoveSec < 0) throw new ArgumentException("invalid time control");
            timeControl = new TimeControl(initialTimeSec, incrementPerMoveSec);
        }
        else timeControl = new DisabledTimeControl();
        MatchmakingContext context = new(user, timeControl);
        _pool.AddUser(context);
        await TryFindOpponent(context);
    }

    public async Task StopOpponentSearchAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new NotFoundException($"user {userId} not found");
        _pool.TryRemoveUser(user.Id);
    }

    private async Task TryFindOpponent(MatchmakingContext context)
    {
        User user = context.User;
        ITimeControl timeControl = context.TimeControl;
        User opponent;
        bool isMatched = false;
        lock (_matchLock)
        {
            MatchmakingContext? opponentContext = _pool.GetAll()
                .FirstOrDefault(opponent =>
                    opponent.User.Id != user.Id &&
                    !opponent.User.IsDeleted &&
                    (
                        (!opponent.TimeControl.IsEnabled && !timeControl.IsEnabled) ||
                        (opponent.TimeControl.IsEnabled && timeControl.IsEnabled &&
                            opponent.TimeControl.InitialTimeSec == timeControl.InitialTimeSec &&
                            opponent.TimeControl.IncrementPerMoveSec == timeControl.IncrementPerMoveSec)
                    ) &&
                    Math.Abs(opponent.User.Rating - user.Rating) <= _settings.RatingRange);
            if (opponentContext == null) return;
            opponent = opponentContext.User;
            bool playerRemoved = _pool.TryRemoveUser(user.Id);
            bool opponentRemoved = _pool.TryRemoveUser(opponent.Id);
            if (!playerRemoved || !opponentRemoved)
            {
                if (playerRemoved) _pool.AddUser(new MatchmakingContext(user, timeControl));
                if (opponentRemoved) _pool.AddUser(new MatchmakingContext(opponent, opponentContext.TimeControl));
                return;
            }
            isMatched = true;
        }

        if (opponent == null || !isMatched) return;
        bool userIsWhite = Random.Shared.Next(2) == 0;
        Guid whiteId = userIsWhite ? user.Id : opponent.Id;
        Guid blackId = userIsWhite ? opponent.Id : user.Id;
        Game game = _sessionService.Create(whiteId, blackId, timeControl);
        await _eventDispatcher.PublishAsync(new GameStarted(GameMapper.ToDto(game)));
        await _uow.CommitChangesAsync();
    }
}