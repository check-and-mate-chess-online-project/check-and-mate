using Application.Services.Interfaces;
using Application.Orchestration.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.UnitOfWork;
using Core.Repositories;
using Core.Models.Games;
using Core.Models.Users;
using Core.Models.Interfaces;

namespace Application.Services;

public class MatchmakingService(GameSessionService sessionService, IUserRepository userRepos, IMatchmakingPool pool, IUnitOfWork uow) : IMatchmakingService
{
    public int Range { get; } = 1000;
    private readonly GameSessionService _sessionService = sessionService;
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IMatchmakingPool _pool = pool;
    private readonly IUnitOfWork _uow = uow;

    public async Task<Game?> StartGameAsync(Guid userId, ITimeControl timeControl)
    {
        User player = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not found");
        Dictionary<User, ITimeControl> candidates = _pool.GetAll();
        User? opponent = candidates
            .Where(x =>
                x.Key.Id != userId &&
                x.Value.IsEnabled() &&
                x.Value.InitialTimeSec == timeControl.InitialTimeSec &&
                x.Value.IncrementPerMoveSec == timeControl.IncrementPerMoveSec)
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
        return game;
    }
}