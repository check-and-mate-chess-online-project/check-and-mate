using Core.Models.Users;

namespace Application.Services.Interfaces;

public interface IUserRegistrationService
{
    Task<User> RegisterAsync(string login, string password, string email, UserRole role);
}