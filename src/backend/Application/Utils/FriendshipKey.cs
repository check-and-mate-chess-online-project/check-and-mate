namespace Application.Utils;

public static class FriendshipKey
{
    public static (Guid, Guid) Normalize(Guid a, Guid b) => a < b ? (a, b) : (b, a);
}