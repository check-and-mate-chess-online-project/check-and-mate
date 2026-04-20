using Application.Abstractions.UnitOfWork;
using Application.Services.Interfaces;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Services;

public class UserDeletionService(IUserRepository userRepos, IUnitOfWork uow) : IUserDeletionService
{
    private readonly IUserRepository _userRepos = userRepos;
    private readonly IUnitOfWork _uow = uow;

    public async Task DeleteAsync(Guid userId)
    {
        User user = await _userRepos.GetAsync(userId) ?? throw new ArgumentException($"user {userId} not exist");
        if (user.IsDeleted) throw new InvalidOperationException($"user {userId} already deleted");
        user.Delete();
        _userRepos.Remove(user);
        await _uow.CommitChangesAsync();
    }
}