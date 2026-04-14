using Core.Models.Games;
using Core.Models.Interfaces;

namespace Core.Services.Interfaces;

public interface IGameService
{
    Task<Game?> GetGameAsync(Guid gameId);
    Task AddGameAsync(Guid whitePlayerId, Guid blackPlayerId, IChessEngine engine, ITimeControl timeControl);
}