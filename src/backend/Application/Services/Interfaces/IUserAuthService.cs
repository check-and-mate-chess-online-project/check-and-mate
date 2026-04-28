using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IUserAuthService
{
    Task<UserDto?> Authorize(string login, string password);
}