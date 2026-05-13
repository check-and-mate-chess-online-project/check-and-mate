using Application.Dtos;
using Core.Models.Users;

namespace Application.Mappers;

public static class UserPublicMapper
{
    public static UserPublicDto ToDto(User user) => new()
    {
        Id = user.Id,
        Login = user.Login,
        Rating = user.Rating,
        Balance = user.Balance,
        LootBoxCount = user.LootBoxCount,
        IsDeleted = user.IsDeleted
    };
}