using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IProfileService
{
    Task<UserDto> GetUserProfile(Guid userId);
    Task<UserPublicDto> GetPublicUserProfile(string login);
    Task UpdateUserAsync(Guid userId, string? login, string? email);
    Task ChangeUserPasswordAsync(Guid userId, string password, string newPassword);
    Task RemoveUserAsync(Guid userId, string password);
}