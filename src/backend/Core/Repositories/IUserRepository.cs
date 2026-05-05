using Core.Models.Users;

namespace Core.Repositories;

public interface IUserRepository
{
    Task<User?> GetAsync(Guid userd);
    Task<User?> GetAsync(string login);
    void Add(User user);
    void Update(User user);
}