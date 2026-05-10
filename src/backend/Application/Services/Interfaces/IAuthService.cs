using Application.Dtos;

namespace Application.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> Authorize(string login, string password);
}