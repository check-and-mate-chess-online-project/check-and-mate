using Core.Models.Users;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class FriendshipMapper
{
    public static Friendship ToDomain(FriendshipEntity entity)
    {
        Friendship friendship = new
        (
            entity.UserId,
            entity.FriendId
        );
        return friendship;
    }

    public static FriendshipEntity ToDb(Friendship friendship) 
        => FriendshipEntity.Create(friendship.FriendAId, friendship.FriendBId);
}