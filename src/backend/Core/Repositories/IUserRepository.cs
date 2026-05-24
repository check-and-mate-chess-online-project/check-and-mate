using Core.Models.Users;

namespace Core.Repositories;

public interface IUserRepository
{
    Task<User?> GetAsync(Guid userId);
    Task<User?> GetAsync(string login);
    Task<User?> GetByEmailAsync(string email);
    void Add(User user);
    Task Update(User user);
}