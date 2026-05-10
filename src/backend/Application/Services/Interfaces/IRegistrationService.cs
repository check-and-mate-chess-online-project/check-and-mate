using Application.Dtos;
using Core.Models.Users;

namespace Application.Services.Interfaces;

public interface IRegistrationService
{
    Task<AuthResultDto> RegisterAsync(string login, string password, string email, UserRole role);
}