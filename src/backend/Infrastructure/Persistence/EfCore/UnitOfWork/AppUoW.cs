using Application.Abstractions.UnitOfWork;
using Infrastructure.Persistence.EfCore.Context;

namespace Infrastructure.Persistence.EfCore.UnitOfWork;

public class AppUoW(AppDbContext context) : IUnitOfWork
{
    private readonly AppDbContext _db = context;

    public async Task CommitChangesAsync() => await _db.SaveChangesAsync();
}