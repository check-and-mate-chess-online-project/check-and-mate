using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Notifications;

namespace Core.Services;

public class NotificationService(INotificationRepository notificationRepos) : INotificationService
{
    private readonly INotificationRepository _notificationRepos = notificationRepos;

    public async Task<Notification?> GetNotificationAsync(Guid notificationId) => await _notificationRepos.GetAsync(notificationId);

    public async Task<List<Notification>> GetUserNotificationsAsync(Guid userId) => await _notificationRepos.GetByUserIdAsync(userId);

    public void AddGameInvitation(Guid userId, Guid senderId, GameInvitationState state, bool isRead = false)
    {
        if (userId == senderId) throw new InvalidOperationException("sender and recipient cannot be the same user");
        GameInvitation gameInvitation = new(userId, senderId, state, isRead);
        _notificationRepos.Add(gameInvitation);
    }

    public void AddFriendRequest(Guid userId, Guid senderId, FriendRequestState state, bool isRead = false)
    {
        if (userId == senderId) throw new InvalidOperationException("sender and recipient cannot be the same user");
        FriendRequest friendRequest = new(userId, senderId, state, isRead);
        _notificationRepos.Add(friendRequest);
    }

    public async Task UpdateNotificationAsync(Notification notification)
    {
        ArgumentNullException.ThrowIfNull(notification);
        if (await _notificationRepos.GetAsync(notification.Id) == null) throw new ArgumentException("notification not exist");
        _notificationRepos.Update(notification);
    }
}