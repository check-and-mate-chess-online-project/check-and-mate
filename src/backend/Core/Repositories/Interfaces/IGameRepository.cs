using Core.Models.Games;

namespace Core.Repositories.Interfaces;

public interface IGameRepository
{
    Task<Game?> GetAsync(Guid gameId);
    Task<List<Game>> GetByUserIdAsync(Guid gameId);
    void Add(Game game);
}