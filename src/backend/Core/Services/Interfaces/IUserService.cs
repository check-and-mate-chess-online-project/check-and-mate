using Core.Models.Users;

namespace Core.Services.Interfaces;

public interface IUserService
{
    Task<User?> GetUserAsync(Guid userId);
    Task AddUserAsync(string login, string password, string email, UserRole role);
    Task ChangeUserLoginAsync(Guid userId, string login);
    Task ChangeUserPasswordAsync(Guid userId, string password);
    Task ChangeUserEmailAsync(Guid userId, string email);
    Task RemoveUserAsync(Guid userId);
}