using System.Collections.Concurrent;
using Application.Abstractions.Connections;

namespace Infrastructure.Connections;

public class ConnectionGracePeriodTimer : IConnectionGracePeriodTimer
{
    private readonly ConcurrentDictionary<Guid, CancellationTokenSource> _timers = new();
    private readonly TimeSpan _gracePeriod = TimeSpan.FromSeconds(30);

    public void StartGracePeriod(Guid userId, Func<Task> onGraceExpired)
    {
        if (_timers.TryRemove(userId, out CancellationTokenSource? oldCts)) oldCts.Cancel();
        CancellationTokenSource cts = new();
        _timers[userId] = cts;
        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(_gracePeriod, cts.Token);
                _timers.TryRemove(userId, out _);
                await onGraceExpired();
            }
            catch (OperationCanceledException) { }
        });
    }

    public void CancelGracePeriod(Guid userId)
    {
        if (_timers.TryRemove(userId, out var cts)) 
            cts.Cancel();
    }
}