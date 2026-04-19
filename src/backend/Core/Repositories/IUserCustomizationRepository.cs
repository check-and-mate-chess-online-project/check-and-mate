using Core.Models.Users;

namespace Core.Repositories;

public interface IUserCustomizationRepository
{
    Task<UserCustomization?> GetAsync(Guid userId);
    void Add(UserCustomization userCustomization);
    void Update(UserCustomization userCustomization);
}