using Core.Models.Requests;

namespace Core.Repositories;

public interface IFriendRequestRepository
{
    Task<FriendRequest?> GetAsync(Guid requestId);
    Task<FriendRequest?> GetPendingAsync(Guid senderId, Guid receiverId);
    Task<List<FriendRequest>> GetByUserAsync(Guid userId);
    Task<List<FriendRequest>> GetPendingByUserAsync(Guid userId);
    void Add(FriendRequest request);
    void Update(FriendRequest request);
}