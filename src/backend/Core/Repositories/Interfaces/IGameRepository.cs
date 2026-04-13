using Core.Models.Games;

namespace Core.Repositories.Interfaces;

public interface IGameRepository
{
    Task<Game> GetAsync(Guid gameId);
    Task AddAsync(Game game);
}