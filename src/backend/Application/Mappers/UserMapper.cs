using Application.Dtos;
using Core.Models.Users;

namespace Application.Mappers;

public static class UserMapper
{
    public static UserDto ToDto(User user) => new()
    {
        Id = user.Id,
        Login = user.Login,
        Email = user.Email,
        Rating = user.Rating,
        Balance = user.Balance,
        LootBoxCount = user.LootBoxCount,
        Role = user.Role,
        IsDeleted = user.IsDeleted
    };
}