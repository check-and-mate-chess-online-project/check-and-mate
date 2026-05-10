using Core.Repositories;
using Core.Models.Requests;

namespace Infrastructure.Persistence.InMemory;

public class FriendRequestRepository : IFriendRequestRepository
{
    private readonly List<FriendRequest> _requests = new();
    private readonly object _lock = new();

    public Task<FriendRequest?> GetAsync(Guid requestId)
    {
        lock (_lock)
            return Task.FromResult(_requests.FirstOrDefault(r => r.Id == requestId));
    }

    public Task<FriendRequest?> GetPendingAsync(Guid senderId, Guid receiverId)
    {
        lock (_lock)
            return Task.FromResult(_requests.FirstOrDefault(r =>
                r.SenderId == senderId && 
                r.ReceiverId == receiverId && 
                r.State == FriendRequestState.Pending));
    }

    public Task<List<FriendRequest>> GetByUserAsync(Guid userId)
    {
        lock (_lock)
            return Task.FromResult(_requests
                .Where(r => r.SenderId == userId || r.ReceiverId == userId)
                .ToList());
    }

    public void Add(FriendRequest request)
    {
        lock (_lock) _requests.Add(request);
    }

    public void Update(FriendRequest request)
    {
        lock (_lock)
        {
            var index = _requests.FindIndex(r => r.Id == request.Id);
            if (index != -1) _requests[index] = request;
        }
    }
}
