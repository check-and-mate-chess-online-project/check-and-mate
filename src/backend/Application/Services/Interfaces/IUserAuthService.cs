using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IUserAuthService
{
    Task<AuthResultDto> Authorize(string login, string password);
}