using Core.Exceptions;

namespace Core.Models.Users;

public class Friendship
{
    public Guid FriendAId { get; }
    public Guid FriendBId { get; }

    public Friendship(Guid friendAId, Guid friendBId)
    {
        if (friendAId == friendBId) throw new CoreLogicException("users must be different"); 
        FriendAId = friendAId < friendBId ? friendAId : friendBId;
        FriendBId = friendAId < friendBId ? friendBId : friendAId;
    }
}