using Application.Dtos;
using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    Task<MoveResultDto> MakeMoveAsync(Guid gameId, Guid userId, Move move);
    Task HandleTimeoutAsync(Guid gameId, Guid userId);
    Task HandleResignAsync(Guid gameId, Guid userId);
    Task HandleDisconnectAsync(Guid gameId, Guid userId);
}