using Application.Dtos;
using Core.Models.Chess;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    GameDto? GetActiveGameByUser(Guid userId);
    Task<MoveResultDto> MakeMoveAsync(Guid userId, Move move);
    Task HandleTimeoutAsync(Guid userId);
    Task HandleResignAsync(Guid userId);
    Task HandleDisconnectAsync(Guid userId);
}