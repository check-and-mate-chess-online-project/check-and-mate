namespace Application.Abstractions.UnitOfWork;

public interface IUnitOfWork
{
    Task CommitChangesAsync();
}