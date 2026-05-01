using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IUserProfileService
{
    Task<UserDto> GetUserProfile(Guid userId);
    Task ChangeUserLoginAsync(Guid userId, string login);
    Task ChangeUserPasswordAsync(Guid userId, string password);
    Task ChangeUserEmailAsync(Guid userId, string email);
    Task RemoveUserAsync(Guid userId);
}