using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.Settings;
using Application.Dtos;
using Application.Mappers;
using Core.Repositories;
using Core.Models.Games;
using Core.Models.Users;
using Core.Models.Interfaces;

namespace Application.Services;

public class MatchmakingService(IGameSettingsProvider settings, IGameSessionService sessionService, IUserRepository userRepos, IMatchmakingPool pool, IUnitOfWork uow) : IMatchmakingService
{
    private readonly IGameSettingsProvider _settings = settings;
    private readonly IGameSessionService _sessionService = sessionService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IMatchmakingPool _pool = pool;
    private readonly IUnitOfWork _uow = uow;

    public async Task<GameDto?> StartGameAsync(Guid userId, bool isEnabled, int initialTimeSec, int incrementPerMoveSec)
    {
        User player = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not found");
        if (player.IsDeleted) throw new InvalidOperationException($"user {userId} is deleted");
        ITimeControl timeControl = isEnabled ? new TimeControl(initialTimeSec, incrementPerMoveSec) : new DisabledTimeControl();
        Dictionary<User, ITimeControl> candidates = _pool.GetAll();
        User? opponent = candidates
            .Where(x =>
                x.Key.Id != userId &&
                !x.Key.IsDeleted &&
                (
                    (!x.Value.IsEnabled && !timeControl.IsEnabled) ||
                    (
                        x.Value.IsEnabled && 
                        timeControl.IsEnabled &&
                        x.Value.InitialTimeSec == timeControl.InitialTimeSec &&
                        x.Value.IncrementPerMoveSec == timeControl.IncrementPerMoveSec
                    )
                ) &&
                Math.Abs(x.Key.Rating - player.Rating) <= _settings.RatingRange)
            .Select(x => x.Key)
            .FirstOrDefault();
        if (opponent == null)
        {
            _pool.AddUser(player, timeControl);
            return null;
        }
        _pool.RemoveUser(player);
        _pool.RemoveUser(opponent);
        bool userIsWhite = Random.Shared.Next(2) == 0;
        Guid whiteId = userIsWhite ? userId : opponent.Id;
        Guid blackId = userIsWhite ? opponent.Id : userId;
        Game game = _sessionService.Create(whiteId, blackId, timeControl);
        await _uow.CommitChangesAsync();
        return GameMapper.GetDto(game);
    }
}