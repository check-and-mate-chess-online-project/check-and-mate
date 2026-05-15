using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IGameplayService
{
    Task<GameDto?> GetActiveGameByUser(Guid userId);
    Task<MoveResultDto> MakeMoveAsync(Guid userId, int A, int B, int X, int Y, MoveOptionsDto moveOptions);
    Task<GameDto?> HandleTimeoutAsync(Guid userId);
    Task<GameDto> HandleResignAsync(Guid userId);
    Task<GameDto?> HandleDisconnectAsync(Guid userId);
}