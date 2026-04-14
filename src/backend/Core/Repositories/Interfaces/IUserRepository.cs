using Core.Models.Users;

namespace Core.Repositories.Interfaces;

public interface IUserRepository
{
    Task<User?> GetAsync(Guid userd);
    void Add(User user);
    Task UpdateAsync(User user);
    Task RemoveAsync(Guid userId);
}