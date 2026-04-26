namespace Infrastructure.Realtime;

public class ConnectionManager
{
    private readonly Dictionary<Guid, string> _map = [];

    public void Add(Guid userId, string connectionId) => _map[userId] = connectionId;

    public void Remove(string connectionId)
    {
        var item = _map.FirstOrDefault(x => x.Value == connectionId);
        if (item.Key != default) _map.Remove(item.Key);
    }

    public string? Get(Guid userId) => _map.TryGetValue(userId, out var c) ? c : null;
}