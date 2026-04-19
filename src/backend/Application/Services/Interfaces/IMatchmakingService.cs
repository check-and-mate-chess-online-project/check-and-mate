using Core.Models.Interfaces;
using Core.Models.Games;

namespace Application.Services.Interfaces;

public interface IMatchmakingService
{
    Task<Game?> StartGameAsync(Guid userId, ITimeControl timeControl);
}