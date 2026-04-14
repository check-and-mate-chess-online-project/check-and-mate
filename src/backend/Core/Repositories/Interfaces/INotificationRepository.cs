using Core.Models.Notifications;

namespace Core.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<Notification?> GetAsync(Guid notificationId);
    Task<List<Notification>> GetByUserIdAsync(Guid userId);
    void Add(Notification notification);
    Task UpdateAsync(Notification notification);
}