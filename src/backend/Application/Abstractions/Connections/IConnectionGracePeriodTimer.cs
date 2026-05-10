namespace Application.Abstractions.Connections;

public interface IConnectionGracePeriodTimer
{
    void StartGracePeriod(Guid userId, Func<Task> onGracePeriodExpired);
    void CancelGracePeriod(Guid userId);
}