using Core.Models.Games;

namespace Core.Repositories;

public interface IGameRepository
{
    Task<Game?> GetAsync(Guid gameId);
    Task<Game?> GetByPlayersAsync(Guid playerAId, Guid playerBId);
    Task<List<Game>> GetByUserIdAsync(Guid userId);
    void Add(Game game);
}