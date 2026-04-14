using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Users;

namespace Core.Services;

public class FriendshipService(IFriendshipRepository friendshipRepos) : IFriendshipService
{
    private readonly IFriendshipRepository _friendshipRepos = friendshipRepos;

    public async Task<Friendship?> GetFriendshipAsync(Guid userId, Guid friendId) => await _friendshipRepos.GetAsync(userId, friendId);

    public async Task AddFriendshipAsync(Guid userId, Guid friendId)
    {
        if (await _friendshipRepos.GetAsync(userId, friendId) != null) throw new InvalidOperationException("friendship already exist");
        Friendship friendship = new(userId, friendId);
        _friendshipRepos.Add(friendship);
    }

    public async Task RemoveFriendshipAsync(Guid userId, Guid friendId)
    {
        if (await _friendshipRepos.GetAsync(userId, friendId) == null) throw new InvalidOperationException("friendship not exist");
        await _friendshipRepos.RemoveAsync(userId, friendId);
    }
}