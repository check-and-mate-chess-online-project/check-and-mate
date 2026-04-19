using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    Task<MoveResult> MakeMoveAsync(Game game, Guid userId, Move move);
    Task HandleTimeoutAsync(Game game, Guid userId);
    Task HandleResignAsync(Game game, Guid userId);
    Task HandleDisconnectAsync(Game game, Guid userId);
}