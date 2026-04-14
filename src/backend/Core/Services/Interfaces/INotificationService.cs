using Core.Models.Notifications;

namespace Core.Services.Interfaces;

public interface INotificationService
{
    Task<List<Notification>> GetUserNotificationAsync(Guid userId);
    void AddNotification(Notification notification);
    Task UpdateNotificationAsync(Notification notification);
}