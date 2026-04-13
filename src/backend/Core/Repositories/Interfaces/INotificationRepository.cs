using Core.Models.Notifications;

namespace Core.Repositories.Interfaces;

public interface INotificationRepository
{
    Task<Notification> GetAsync(Guid notificationId);
    Task AddAsync(Notification notification);
    Task UpdateAsync(Notification notification);
}