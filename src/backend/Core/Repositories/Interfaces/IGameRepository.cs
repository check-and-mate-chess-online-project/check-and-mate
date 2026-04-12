using Core.Models.Games;

namespace Core.Repositories.Interfaces;

public interface IGameRepository
{
    Task<Game> GetAsync(Guid id);
    Task<List<Game>> GetAllAsync();
    Task AddAsync(Game game);
    Task UpdateAsync(Game game);
    Task RemoveAsync(Guid id);
}