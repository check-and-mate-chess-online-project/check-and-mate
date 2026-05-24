using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Models.Games;
using Core.Repositories;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class GameRepository(AppDbContext context) : IGameRepository
{
    private readonly AppDbContext _context = context;

    public async Task<Game?> GetAsync(Guid gameId)
    {
        GameEntity? game = await _context.Games.FirstOrDefaultAsync(g => g.Id == gameId);
        return game != null ? GameMapper.ToDomain(game) : null;
    }
    
    public async Task<List<Game>> GetByUserIdAsync(Guid userId)
    {
        List<GameEntity> games = await _context.Games
            .Where(g => g.WhitePlayerId == userId || g.BlackPlayerId == userId)
            .OrderByDescending(g => g.StartTimeUtc)
            .ToListAsync();
        return [.. games.Select(GameMapper.ToDomain)];
    }

    public void Add(Game game) => _context.Games.Add(GameMapper.ToDb(game));
}