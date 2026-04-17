using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    Task<MoveResult> MakeMoveAsync(Guid gameId, Guid userId, Move move);
    Task<Game> HandleTimeoutAsync(Guid gameId, Guid userId);
    Task<Game> HandleResignAsync(Guid gameId, Guid userId);
    Task<Game> HandleDisconnectAsync(Guid gameId, Guid userId);
}