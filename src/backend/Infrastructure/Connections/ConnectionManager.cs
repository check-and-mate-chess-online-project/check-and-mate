using System.Collections.Concurrent;

namespace Infrastructure.Connections;

public class ConnectionManager
{
    private readonly ConcurrentDictionary<Guid, string> _connections = [];

    public void Add(Guid userId, string connectionId) => _connections[userId] = connectionId;

    public void Remove(string connectionId)
    {
        var item = _connections.FirstOrDefault(x => x.Value == connectionId);
        if (item.Key != default) _connections.Remove(item.Key, out _);
    }

    public string? Get(Guid userId) => _connections.TryGetValue(userId, out var connectionId) ? connectionId : null;
}