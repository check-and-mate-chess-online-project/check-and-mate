using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Settings;
using Application.Abstractions.Events;
using Application.Events;
using Application.Mappers;
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
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not found");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        ITimeControl timeControl;
        if (timeControlEnabled)
        {
            if (initialTimeSec <= 0 || incrementPerMoveSec < 0) throw new ArgumentException("invalid time control");
            timeControl = new TimeControl(initialTimeSec, incrementPerMoveSec);
        }
        else timeControl = new DisabledTimeControl();
        _pool.AddUser(user, timeControl);
        await TryFindOpponent(user, timeControl);
    }

    public async Task StopOpponentSearchAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not found");
        _pool.TryRemoveUser(user);
    }

    private async Task TryFindOpponent(User user, ITimeControl timeControl)
    {
        User? opponent;
        bool isMatched = false;
        lock (_matchLock)
        {
            opponent = _pool.GetAll()
                .Where(x =>
                    x.Key.Id != user.Id &&
                    !x.Key.IsDeleted &&
                    (
                        (!x.Value.IsEnabled && !timeControl.IsEnabled) ||
                        (x.Value.IsEnabled && timeControl.IsEnabled &&
                            x.Value.InitialTimeSec == timeControl.InitialTimeSec &&
                            x.Value.IncrementPerMoveSec == timeControl.IncrementPerMoveSec)
                    ) &&
                    Math.Abs(x.Key.Rating - user.Rating) <= _settings.RatingRange)
                .Select(x => x.Key)
                .FirstOrDefault();
            if (opponent == null) return;
            bool playerRemoved = _pool.TryRemoveUser(user);
            bool opponentRemoved = _pool.TryRemoveUser(opponent);
            if (!playerRemoved || !opponentRemoved)
            {
                if (playerRemoved) _pool.AddUser(user, timeControl);
                else _pool.AddUser(opponent, timeControl);
                return;
            }
            isMatched = true;
        }

        if (opponent == null || !isMatched) return;
        bool userIsWhite = Random.Shared.Next(2) == 0;
        Guid whiteId = userIsWhite ? user.Id : opponent.Id;
        Guid blackId = userIsWhite ? opponent.Id : user.Id;
        Game game = _sessionService.Create(whiteId, blackId, timeControl);
        await _eventDispatcher.PublishAsync(new GameStarted(GameMapper.GetDto(game)));
        await _uow.CommitChangesAsync();
    }
}