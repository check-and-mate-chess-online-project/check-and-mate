using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    Task<MoveResult> MakeMoveAsync(Guid gameId, Guid userId, Move move);
    Task HandleTimeoutAsync(Guid gameId, Guid userId);
    Task HandleResignAsync(Guid gameId, Guid userId);
    Task HandleDisconnectAsync(Guid gameId, Guid userId);
}