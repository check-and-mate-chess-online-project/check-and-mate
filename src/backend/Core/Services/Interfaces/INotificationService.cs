using Core.Models.Notifications;

namespace Core.Services.Interfaces;

public interface INotificationService
{
    Task<Notification?> GetNotificationAsync(Guid notificationId);
    Task<List<Notification>> GetUserNotificationsAsync(Guid userId);
    void AddGameInvitation(Guid userId, Guid senderId, GameInvitationState state, bool isRead = false);
    void AddFriendRequest(Guid userId, Guid senderId, FriendRequestState state, bool isRead = false);
    Task UpdateNotificationAsync(Notification notification);
}