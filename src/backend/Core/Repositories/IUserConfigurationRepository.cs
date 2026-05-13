using Core.Models.Users;

namespace Core.Repositories;

public interface IUserConfigurationRepository
{
    Task<UserConfiguration?> GetAsync(Guid userId);
    void Add(UserConfiguration userConfiguration);
    void Update(UserConfiguration userConfiguration);
}