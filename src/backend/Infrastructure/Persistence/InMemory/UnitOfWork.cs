using Application.Abstractions.UnitOfWork;

namespace Infrastructure.Persistence.InMemory;

public class UnitOfWork : IUnitOfWork
{
    public Task CommitChangesAsync()
    {
        return Task.CompletedTask;
    }
}