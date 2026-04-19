namespace Application.Services.Interfaces;

public interface IUserSettingsService
{
    Task ChangeUserLoginAsync(Guid userId, string login);
    Task ChangeUserPasswordAsync(Guid userId, string password);
    Task ChangeUserEmailAsync(Guid userId, string email);
    Task RemoveUserAsync(Guid userId);
}