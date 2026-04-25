using Application.Dtos;
using Core.Models.Users;

namespace Application.Services.Interfaces;

public interface IUserRegistrationService
{
    Task<UserDto> RegisterAsync(string login, string password, string email, UserRole role);
}