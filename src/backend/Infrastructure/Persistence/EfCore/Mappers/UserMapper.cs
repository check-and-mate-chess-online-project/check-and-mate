using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Users;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class UserMapper
{
    public static User ToDomain(UserEntity user)
    {
        return User.Restore
        (
            user.Id,
            user.Login,
            user.PasswordHash,
            user.Email,
            user.Rating,
            user.Balance,
            user.LootBoxCount,
            (UserRole)user.Role,
            user.IsDeleted
        );
    }

    public static UserEntity ToDb(User user)
    {
        return UserEntity.Create
        (
            user.Id, 
            user.Login, 
            user.PasswordHash, 
            user.Email, 
            user.Rating,
            user.Balance,
            user.LootBoxCount,
            (int)user.Role,
            user.IsDeleted
        );
    }
}